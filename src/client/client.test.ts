import {describe, expect, it} from "vitest";
import {NodeTSNClient} from "./client";
import {ethers} from "ethers";
import {StreamId} from "../util/StreamId";

describe('Client', {timeout: 15000}, () => {
    // Skip in CI, because it needs a local node
    it.skipIf(process.env.CI);

    const wallet = new ethers.Wallet("0x0000000000000000000000000000000000000000000000000000000000000001");
    const walletProvider = {
        getAddress: () => wallet.address,
        getSigner: () => wallet,
    };
    it('should create a client', async () => {
        const client = new NodeTSNClient({endpoint: "http://localhost:8484", walletProvider, chainId: "1234567890"});
        const kwilClient = client.getKwilClient();
        const chainInfo = await kwilClient.chainInfo();
        expect(chainInfo.data?.chain_id).toBeDefined();
    });

    it("should deploy a stream", async () => {
        const chainId = await NodeTSNClient.getDefaultChainId("http://localhost:8484");
        if (!chainId) {
            throw new Error("Chain id not found");
        }
        const client = new NodeTSNClient({
            chainId,
            endpoint: "http://localhost:8484",
            walletProvider,
        });
        const streamId = await StreamId.generate("test");
        await using cleanup = new AsyncDisposableStack();
        cleanup.defer(async () => {
            await client.destroyStream(streamId, true);
        });
        const receipt = await client.deployStream(streamId, "primitive", true);
        expect(receipt.status).toBe(200);
    });

    it("should wait for a transaction", async () => {
        const chainId = await NodeTSNClient.getDefaultChainId("http://localhost:8484");
        if (!chainId) {
            throw new Error("Chain id not found");
        }
        const client = new NodeTSNClient({endpoint: "http://localhost:8484", walletProvider, chainId});
        await using cleanup = new AsyncDisposableStack();
        cleanup.defer(async () => {
            await client.destroyStream(streamId, true).catch(() => {});
        });
        const streamId = await StreamId.generate("test");
        const receipt = await client.deployStream(streamId, "primitive", false);
        if (!receipt.data?.tx_hash) {
            throw new Error("Tx hash not found");
        }
        const receipt2 = await client.waitForTx(receipt.data.tx_hash);
        expect(receipt2.height).toBeGreaterThan(0);
    });

    it("list my streams", async () => {
        const chainId = await NodeTSNClient.getDefaultChainId("http://localhost:8484");
        if (!chainId) {
            throw new Error("Chain id not found");
        }
        const client = new NodeTSNClient({endpoint: "http://localhost:8484", walletProvider, chainId});
        await using cleanup = new AsyncDisposableStack();
        cleanup.defer(async () => {
            await client.destroyStream(streamId, true).catch(() => {});
        });
        const streamId = await StreamId.generate("test");
        await client.deployStream(streamId, "primitive", true);
        const streams = await client.getAllStreams(client.address());
        expect(streams.length).toBeGreaterThan(0);
    });

    it("try query a stream", async () => {
        // TODO: this test is temporary just for development, will get replaced by one that also deploys streams
        const chainId = await NodeTSNClient.getDefaultChainId("http://localhost:8484");
        if (!chainId) {
            throw new Error("Chain id not found");
        }

        const client = new NodeTSNClient({endpoint: "http://localhost:8484", walletProvider, chainId, autoAuthenticate: true});
        const streamId = StreamId.fromString("st39830c44932bc42a3bffef72310948").throw();
        const stream = client.loadStream(client.ownStreamLocator(streamId));
        const record = await (await stream).getRecord({});
        expect(record.length).toBeGreaterThan(0);
    });

    it("insert records", async () => {
        const chainId = await NodeTSNClient.getDefaultChainId("http://localhost:8484");
        if (!chainId) {
            throw new Error("Chain id not found");
        }
        const client = new NodeTSNClient({endpoint: "http://localhost:8484", walletProvider, chainId});
        await using cleanup = new AsyncDisposableStack();
        const streamId = await StreamId.generate("test");
        cleanup.defer(async () => {
            await client.destroyStream(streamId, true).catch(() => {});
        });

        const stream = await client.deployStream(streamId, "primitive", true);
        const primitiveStream = client.loadPrimitiveStream
        const receipt = await primitiveStream.insertRecords([{dateValue: "2024-01-01", value: "100"}]);
        expect(receipt.status).toBe(200);
    });
});
