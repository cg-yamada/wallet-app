"use client"

import { Button, Container, Image, Paper, SimpleGrid, Stack, Text, TextInput } from "@mantine/core"
import { Alchemy, Network, type OwnedNft } from "alchemy-sdk"
import { useEffect, useState } from "react"
import { type Address, erc721Abi } from "viem"
import { polygon } from "viem/chains"
import { useAccount, useChainId, useSignTypedData, useWriteContract } from "wagmi"

/** ウォレットアドレスに紐づくNFTを取得 */
async function getNFTs(chainId: number, walletAddress: Address): Promise<OwnedNft[]> {
  const alchemy = new Alchemy({
    apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    network: chainId === polygon.id ? Network.MATIC_MAINNET : Network.MATIC_AMOY,
  })
  const { ownedNfts } = await alchemy.nft.getNftsForOwner(walletAddress)
  return ownedNfts
}

export default function Home() {
  const chainId = useChainId()
  const account = useAccount()
  const { writeContract } = useWriteContract()
  const eip712 = useSignTypedData()
  const [NFTContractAddress, setNFTContractAddress] = useState<Address>()
  const [eip712Signature, setEip712Signature] = useState<Address>()
  const [toAddress, setToAddress] = useState<Address>()
  const [currentNFTs, setCurrentNFTs] = useState<OwnedNft[]>([])
  const [selectedNFT, setSelectedNFT] = useState<OwnedNft>()

  /** 初期表示データ取得 */
  useEffect(() => {
    if (!account.address) return
    getNFTs(chainId, account.address).then((nfts) => {
      console.log({ nfts })
      setCurrentNFTs(nfts)
    })
  }, [chainId, account.address])

  /** NFTを譲渡する */
  async function transferNFT() {
    if (!toAddress || !selectedNFT || !NFTContractAddress) {
      console.log({ toAddress, selectedNFT, NFTContractAddress })
      return
    }
    writeContract({
      address: NFTContractAddress,
      abi: erc721Abi,
      functionName: "safeTransferFrom",
      // @ts-ignore
      args: [account.address, toAddress, selectedNFT.tokenId], // from,to,tokenId
    })
  }

  async function handleSign() {
    const signature = await eip712.signTypedDataAsync({
      primaryType: "Mail",
      types: {
        Person: [
          { name: "name", type: "string" },
          { name: "wallet", type: "address" },
        ],
        Mail: [
          { name: "from", type: "Person" },
          { name: "to", type: "Person" },
          { name: "contents", type: "string" },
        ],
      },
      message: {
        from: { name: "Cow", wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826" },
        to: { name: "Bob", wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB" },
        contents: "Hello, Bob!",
      },
    })
    setEip712Signature(signature)
  }

  return (
    <Container my={40}>
      <w3m-button />
      <Button mt={8} onClick={handleSign} children="署名する" fullWidth />
      <Text mt={8} children={`署名結果）${eip712Signature ? `${eip712Signature?.slice(0, 10)}......${eip712Signature?.slice(-10)}` : ""}`} />
      <Stack mt={20} gap={32}>
        <TextInput
          label="contractAddress"
          placeholder="NFTのコントラクトアドレス"
          onChange={(e) => setNFTContractAddress(e.target.value as Address)}
        />
        <TextInput label="fromAddress" value={`${account.address?.slice(0, 4)}......${account.address?.slice(-6)}`} disabled />
        <TextInput label="toAddress" placeholder="譲渡先のウォレットアドレス" onChange={(e) => setToAddress(e.target.value as Address)} />
        <Button
          onClick={transferNFT}
          children={selectedNFT ? `TokenId=${selectedNFT.tokenId} を転送する` : "譲渡するNFTを選択してください"}
          disabled={!selectedNFT || !toAddress || !NFTContractAddress}
        />
      </Stack>
      <SimpleGrid mt={40} cols={2}>
        {currentNFTs.map((nft) => (
          <Paper bg={nft.tokenId === selectedNFT?.tokenId ? "teal.4" : "gray.3"} radius="sm" key={nft.tokenId} onClick={() => setSelectedNFT(nft)}>
            <Image src={nft.image.cachedUrl} alt={nft.name} fit="cover" radius="sm" />
            <Text mt={8} px={16} pb={16} children={`TokenId: ${nft.tokenId}`} />
          </Paper>
        ))}
      </SimpleGrid>
    </Container>
  )
}
