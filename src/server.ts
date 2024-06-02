const express = require('express');
const grpc = require('@grpc/grpc-js');
const { connect, signers, Contract, Identity, Signer } = require('@hyperledger/fabric-gateway');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const { TextDecoder } = require('util');
const cors = require('cors')

const app = express();
const port = 3000;

//cors
app.use(cors());
// Middleware để parse JSON
app.use(express.json());

// Các biến cấu hình với giá trị mặc định
const channelName = 'mychannel';
const chaincodeName = 'basic';
const mspId = 'Org1MSP';
const cryptoPath = path.resolve(__dirname, '..', '..', '..', '..', 'test-network/organizations/peerOrganizations/org1.example.com');
const keyDirectoryPath = path.resolve(cryptoPath, 'users', 'User1@org1.example.com', 'msp', 'keystore');
const certDirectoryPath = path.resolve(cryptoPath, 'users', 'User1@org1.example.com', 'msp', 'signcerts');
const tlsCertPath = path.resolve(cryptoPath, 'peers', 'peer0.org1.example.com', 'tls', 'ca.crt');
const peerEndpoint = 'localhost:7051';
const peerHostAlias = 'peer0.org1.example.com';
const assetId = `asset${Date.now()}`;

const utf8Decoder = new TextDecoder();

let contract: typeof Contract;

// API lấy smart contract đã được deploy từ mạng
app.post('/api/network', async (req: any, res: any) => {
    try {
        // The gRPC client connection should be shared by all Gateway connections to this endpoint.
        const client = await newGrpcConnection();

        const gateway = connect({
            client,
            identity: await newIdentity(),
            signer: await newSigner(),
            // Default timeouts for different gRPC calls
            evaluateOptions: () => {
                return { deadline: Date.now() + 5000 }; // 5 seconds
            },
            endorseOptions: () => {
                return { deadline: Date.now() + 15000 }; // 15 seconds
            },
            submitOptions: () => {
                return { deadline: Date.now() + 5000 }; // 5 seconds
            },
            commitStatusOptions: () => {
                return { deadline: Date.now() + 60000 }; // 1 minute
            },
        });

        // Get a network instance representing the channel where the smart contract is deployed.
        const network = gateway.getNetwork(channelName);

        // Get the smart contract from the network.
        contract = network.getContract(chaincodeName);

        return res.status(200).send({ message: 'Created network success' });
    } catch (error: any) {
        console.error(`Failed to created network: ${error}`);
        res.status(500).json({ error: error.toString() });
    }
})

// API để khởi tạo sổ cái
app.post('/api/ledger', async (req: any, res: any) => {
    try {
        const result = await initLedger(contract)

        return res.status(201).send({ message: result });
    } catch (error: any) {
        console.error(`Failed to initLedger: ${error}`);
        res.status(500).json({ error: error.toString() });
    }
});


// API để lấy tất cả tài sản
app.get('/api/assets', async (req: any, res: any) => {
    try {
        const result = await getAllAssets(contract)
        res.json(result);
    } catch (error: any) {
        console.error(`Failed to get assets: ${error}`);
        res.status(500).json({ error: error.toString() });
    }
});

// API thay đổi chủ sở hữu
app.post('/api/transfer/:id', async (req: any, res: any) => {
    try {
        const result = await transferAssetAsync(contract, req.params.id, req.body.owner)
        res.json({ message: result });
    } catch (error: any) {
        console.error(`Failed to update owner: ${error}`);
        res.status(500).json({ error: error.toString() });
    }
});

// API tạo 1 tài sản
app.post('/api/assets', async (req: any, res: any) => {
    try {
        const result = await createAsset(contract, req.body)
        res.json({ message: result });
    } catch (error: any) {
        console.error(`Failed to create asset: ${error}`);
        res.status(500).json({ error: error.toString() });
    }
});

// API lấy chi tiết 1 tài sản
app.get('/api/assets/:id', async (req: any, res: any) => {
    try {
        const result = await readAssetByID(contract, req.params.id)
        res.json(result);
    } catch (error: any) {
        console.error(`Failed to find one asset: ${error}`);
        res.status(500).json({ error: error.toString() });
    }
});

// API cập nhật tài sản
app.put('/api/assets/:id', async (req: any, res: any) => {
    try {
        const result = await updateAsset(contract, req.params.id, req.body)
        res.json({ message: result });
    } catch (error: any) {
        console.error(`Failed to update owner: ${error}`);
        res.status(500).json({ error: error.toString() });
    }
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

/**
 * This type of transaction would typically only be run once by an application the first time it was started after its
 * initial deployment. A new version of the chaincode deployed later would likely not need to run an "init" function.
 */
async function initLedger(contract: typeof Contract): Promise<string> {
    console.log('\n--> Submit Transaction: InitLedger, function creates the initial set of assets on the ledger');

    await contract.submitTransaction('InitLedger');

    return '*** Transaction committed successfully';
}

/**
 * Evaluate a transaction to query ledger state.
 */
async function getAllAssets(contract: typeof Contract): Promise<void> {
    console.log('\n--> Evaluate Transaction: GetAllAssets, function returns all the current assets on the ledger');

    const resultBytes = await contract.evaluateTransaction('GetAllAssets');

    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    console.log('*** Result:', result);
    return result
}

/**
 * Submit a transaction synchronously, blocking until it has been committed to the ledger.
 */
type TBodyAsset = {
    color: string, size: string, owner: string, appraisedValue: string, id: string
}
async function createAsset(contract: typeof Contract, body: TBodyAsset): Promise<string> {
    console.log('\n--> Submit Transaction: CreateAsset, creates new asset with ID, Color, Size, Owner and AppraisedValue arguments');

    console.log(body)
    await contract.submitTransaction(
        'CreateAsset',
        assetId,
        body.color,
        body.size,
        body.owner,
        body.appraisedValue,
    );

    return '*** CreateAsset successfully';
}

/**
 * Submit transaction asynchronously, allowing the application to process the smart contract response (e.g. update a UI)
 * while waiting for the commit notification.
 */
async function transferAssetAsync(contract: typeof Contract, id: string, newOwner: string): Promise<string> {
    console.log('\n--> Async Submit Transaction: TransferAsset, updates existing asset owner');

    const commit = await contract.submitAsync('TransferAsset', {
        arguments: [id, newOwner],
    });
    const oldOwner = utf8Decoder.decode(commit.getResult());

    console.log(`*** Successfully submitted transaction to transfer ownership from ${oldOwner} to ${newOwner}`);
    console.log('*** Waiting for transaction commit');

    const status = await commit.getStatus();
    if (!status.successful) {
        throw new Error(`Transaction ${status.transactionId} failed to commit with status code ${status.code}`);
    }

    console.log('*** Transaction committed successfully');

    return `*** Successfully submitted transaction to transfer ownership from ${oldOwner} to ${newOwner}`
}

async function readAssetByID(contract: typeof Contract, assetsId: string): Promise<void> {
    console.log('\n--> Evaluate Transaction: ReadAsset, function returns asset attributes');

    const resultBytes = await contract.evaluateTransaction('ReadAsset', assetsId);

    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    console.log('*** Result:', result);
    return result
}

async function updateAsset(contract: typeof Contract, id: string, body: TBodyAsset): Promise<string> {
    await contract.submitTransaction(
        'UpdateAsset',
        id,
        body.color,
        body.size,
        body.owner,
        body.appraisedValue,
    );
    return '******** Successfully to update asset';
}

async function newGrpcConnection(): Promise<any> {
    const tlsRootCert = await fs.readFile(tlsCertPath);
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
    return new grpc.Client(peerEndpoint, tlsCredentials, {
        'grpc.ssl_target_name_override': peerHostAlias,
    });
}

async function newIdentity(): Promise<typeof Identity> {
    const certPath = await getFirstDirFileName(certDirectoryPath);
    const credentials = await fs.readFile(certPath);
    return { mspId, credentials };
}

async function getFirstDirFileName(dirPath: string): Promise<string> {
    const files = await fs.readdir(dirPath);
    return path.join(dirPath, files[0]);
}

async function newSigner(): Promise<typeof Signer> {
    const keyPath = await getFirstDirFileName(keyDirectoryPath);
    const privateKeyPem = await fs.readFile(keyPath);
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    return signers.newPrivateKeySigner(privateKey);
}

/**
 * displayInputParameters() will print the global scope parameters used by the main driver routine.
 */
async function displayInputParameters(): Promise<void> {
    console.log(`channelName:       ${channelName}`);
    console.log(`chaincodeName:     ${chaincodeName}`);
    console.log(`mspId:             ${mspId}`);
    console.log(`cryptoPath:        ${cryptoPath}`);
    console.log(`keyDirectoryPath:  ${keyDirectoryPath}`);
    console.log(`certDirectoryPath: ${certDirectoryPath}`);
    console.log(`tlsCertPath:       ${tlsCertPath}`);
    console.log(`peerEndpoint:      ${peerEndpoint}`);
    console.log(`peerHostAlias:     ${peerHostAlias}`);
}
displayInputParameters()
