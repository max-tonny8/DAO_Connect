// @ts-nocheck comment
import React, { useEffect, useState } from "react";
import { ParticleProvider } from "@particle-network/provider";
import { useRouter } from "next/router";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import usersideabi from "../../utils/usersideabi.json";
import {
  FormHelperText,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  Textarea,
  Heading,
  useToast,
  Avatar,
  Center,
  Image,
  Flex,
  Text,
  Stack,
  useColorModeValue,
  FormControl,
  FormLabel,
  Icon,
  Input,
  VisuallyHidden,
  chakra,
  Grid,
  GridItem,
  Tooltip,
  VStack,
  Divider,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  TabPanels,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Radio,
  RadioGroup,
  Select,
} from "@chakra-ui/react";
import UserSideAbi from "../../utils/usersideabi.json";
import GovernanceTokenAbi from "../../utils/governancetokenabi.json";

const index = () => {
  const router = useRouter();
  const account = useAccount();
  const [isMember, setIsMember] = useState(false);
  const [size, setSize] = useState("md");
  const [propSignal, setPropSignal] = useState(false);
  const [daoInfo, setDaoInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [daoProposals, setDaoProposals] = useState([]);
  const [daoMembers, setDaoMembers] = useState([]);
  const [tokenAddress, setTokenAddress] = useState("");
  const [totalMembers, setTotalMembers] = useState(0);
  const [voteOnce, setvoteOnce] = useState(true);
  const [adminInfo, setAdminInfo] = useState();
  const [votingthreshold, setVotingThreshold] = useState();
  const [proposalArray, setProposalArray] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState();
  const [passingThreshold, setPassingThreshold] = useState();
  const { address } = useAccount();
  const [proposalType, setProposalType] = useState();
  const [proposalForVote, setProposalForVote] = useState(0);
  const [userResponse, setUserResponse] = useState(-1);

  const [endTime, setEndTime] = useState();

  const toast = useToast();

  const convertToEpoch = (dateString: any) => {
    const epochValue = new Date(dateString + "T00:00:00Z").getTime() / 1000;
    return epochValue;
  };

  // add proposal
  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onClose: onAddClose,
  } = useDisclosure();

  // to vote
  const {
    isOpen: isVoteOpen,
    onOpen: onVoteOpen,
    onClose: onVoteClose,
  } = useDisclosure();

  //add new member to dao
  const {
    isOpen: isStartOpen,
    onOpen: onStartOpen,
    onClose: onStartClose,
  } = useDisclosure();

  //view results
  const {
    isOpen: isEndOpen,
    onOpen: onEndOpen,
    onClose: onEndClose,
  } = useDisclosure();

  const handleSizeClick1 = (newSize) => {
    setSize(newSize);
    onAddOpen();
  };

  const handleSizeClick2 = (newSize) => {
    setSize(newSize);
    onVoteOpen();
  };

  const handleSizeClick3 = (newSize) => {
    setSize(newSize);
    onStartOpen();
  };

  const handleSizeClick4 = (newSize) => {
    setSize(newSize);
    onEndOpen();
  };

  const onLoad = async () => {
    const daoId = router.query.daoId;
    if (daoId) {
      if (window.ethereum._state.accounts.length !== 0) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const userSideInstance = new ethers.Contract(
          process.env.NEXT_PUBLIC_USERSIDE_ADDRESS,
          usersideabi,
          signer
        );
        console.log(userSideInstance);
        const tempDaoInfo = await userSideInstance.daoIdtoDao(daoId);
        setDaoInfo(tempDaoInfo);
        const tempDaoMembers = await userSideInstance.getAllDaoMembers(daoId);
        console.log(tempDaoMembers);
        setTotalMembers(tempDaoMembers.length);
        const tempDaoProposals = await userSideInstance.getAllDaoProposals(
          daoId
        );
        console.log(tempDaoProposals);
        const membershipSignal = await userSideInstance.checkMembership(
          daoId,
          account.address
        );
        setIsMember(membershipSignal);
        console.log("Membership signal: " + membershipSignal);
        setLoading(false);
        console.log("Dao Status: " + tempDaoInfo.isPrivate);
        const tempAdminId = await tempDaoInfo.creator;
        const tempAdminInfo = await userSideInstance.userIdtoUser(tempAdminId);
        console.log(tempAdminInfo);
        setAdminInfo(tempAdminInfo);
      }
    }
  };

  const authorizeContract = async () => {
    if (window?.ethereum?._state?.accounts?.length !== 0) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const userSideInstance = new ethers.Contract(
        process.env.NEXT_PUBLIC_USERSIDE_ADDRESS,
        usersideabi,
        signer
      );
      console.log(userSideInstance);
      const accounts = await provider.listAccounts();
      const propInfo = await userSideInstance.proposalIdtoProposal(
        proposalForVote
      );
      const govTokenAdd = propInfo.votingTokenAddress;
      var minThreshold = propInfo.votingThreshold;
      const govTokenContract = new ethers.Contract(
        govTokenAdd,
        GovernanceTokenAbi,
        signer
      );
      const tokenSymbol = await govTokenContract.symbol();
      console.log(tokenSymbol);
      const tx = await govTokenContract.approve(
        process.env.NEXT_PUBLIC_USERSIDE_ADDRESS,
        minThreshold
      );
      await tx.wait();
      toast({
        title: "Congrats! Transaction Complete",
        description: `Your vote will be counted soon.`,
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      const tx2 = await userSideInstance.voteForProposal(
        proposalForVote,
        userResponse,
        account.address
      );
      await tx2.wait();
      toast({
        title: "Congrats.",
        description: `Your vote has been counted.`,
        status: "success",
        duration: 10000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  useEffect(() => {
    onLoad();
  }, [router]);

  console.log(proposalType);

  const loadAllProposals = async () => {
    if (window.ethereum._state.accounts.length !== 0) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const userSideContract = new ethers.Contract(
        process.env.NEXT_PUBLIC_USERSIDE_ADDRESS,
        UserSideAbi,
        signer
      );

      const totalProposals = Number(
        await userSideContract.getAllDaoProposals(BigInt(daoInfo.daoId))
      );
      let tempProposalId,
        tempProposalInfo,
        governanceTokenContract,
        tokenSymbol,
        tokenName;
      let tempProposalArray = await userSideContract.getAllDaoProposals(
        daoInfo.daoId
      );

      console.log(tempProposalArray);
      for (let i = 0; i < tempProposalArray.length; i++) {
        tempProposalInfo = await userSideContract.proposalIdtoProposal(
          tempProposalArray[i]
        );
        console.log(tempProposalInfo);

        governanceTokenContract = new ethers.Contract(
          tempProposalInfo.votingTokenAddress,
          GovernanceTokenAbi,
          signer
        );
        tokenSymbol = await governanceTokenContract.symbol();
        tokenName = await governanceTokenContract.name();
        console.log(tokenSymbol);
        console.log(tokenName);
        console.log(tempProposalInfo);
        setProposalArray((prevState) => [
          ...prevState,
          {
            proposalInfo: tempProposalInfo,
            tokenName: tokenName,
            tokenSymbol: tokenSymbol,
          },
        ]);
      }
      // for (let i = 0; i < totalProposals; i++) {
      //   tempProposalInfo = await userSideContract.proposalIdtoproposal(
      //     tempProposalId
      //   );
      //   governanceTokenContract = new ethers.Contract(
      //     tempProposalInfo.governanceTokenAddress,
      //     GovernanceTokenAbi,
      //     signer
      //   );
      //   tokenSymbol = await governanceTokenContract.symbol();
      //   tokenName = await governanceTokenContract.name();
      //   console.log(tokenSymbol);
      //   console.log(tokenName);
      //   console.log(tempProposalInfo);
      //   setProposalArray((prevState) => [
      //     ...prevState,
      //     {
      //       proposalInfo: tempProposalInfo,
      //       tokenName: tokenName,
      //       tokenSymbol: tokenSymbol,
      //     },
      //   ]);
      // }
      setPropSignal(true);
    }
  };

  const addProposal = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const userSideContract = new ethers.Contract(
      process.env.NEXT_PUBLIC_USERSIDE_ADDRESS,
      UserSideAbi,
      signer
    );

    console.log(title);
    console.log(description);
    console.log(votingthreshold);
    console.log(daoInfo.daoId.toString());
    console.log(tokenAddress);
    console.log(address);
    console.log(startDate);
    console.log(endTime);
    console.log(passingThreshold);
    console.log(voteOnce);
    console.log(daoInfo);

    const tx = await userSideContract.createProposal(
      proposalType,
      title + "|" + description,
      votingthreshold,
      daoInfo.daoId,
      tokenAddress,
      address,
      startDate,
      endTime,
      passingThreshold,
      voteOnce
    );

    await tx.wait();

    toast({
      title: "Proposal Created",
      description: "Your proposal has been created",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
  };

  const convertTimeToEpoch = async () => {
    var now = new Date();
    var timestamp = now.getTime();
    var secondsSinceEpoch = timestamp / 1000;
    return secondsSinceEpoch;
  };

  const filteringDaos = (beginningTime, endingTime) => {
    var now = new Date();
    var timestamp = now.getTime();
    var secondsSinceEpoch = timestamp / 1000;
    console.log(beginningTime);
    if (secondsSinceEpoch < Number(beginningTime)) {
      //to be happening in future
      return -1;
    }
    if (secondsSinceEpoch > Number(endingTime)) {
      //to have happened in past
      return 1;
    }
    return 0;
  };

  if (loading) {
    return <Center>Loading...</Center>;
  }

  if (daoInfo.isPrivate && !isMember) {
    return <Center>You are not the member of this DAO.</Center>;
  }

  console.log(voteOnce);

  return (
    <div>
      <div>This is dao number: {Number(daoInfo.daoId)}</div>
      <div>Dao Name: {daoInfo.daoName}</div>
      <div> Dao description: {daoInfo.daoDescription} </div>
      <div> Dao Governance Token: {daoInfo.governanceTokenAddress} </div>
      <div> Total Members: {totalMembers} </div>
      <div>
        {" "}
        Creator Name and Wallet Address: {adminInfo?.userName} -{" "}
        {adminInfo?.userWallet}
      </div>

      {isMember ? (
        <Button mt="2%" m={2} onClick={() => handleSizeClick1("xl")}>
          Add Proposal{" "}
        </Button>
      ) : null}

      {adminInfo?.userWallet === address ? (
        <Button mt="2%" m={2} onClick={() => handleSizeClick3("xl")}>
          Add member
        </Button>
      ) : null}
      <Divider mt={12} mb={12} />
      <Grid
        templateColumns={{
          base: "repeat(1, 1fr)",
          sm: "repeat(2, 1fr)",
          md: "repeat(2, 1fr)",
        }}
        gap={4}
      >
        <GridItem colSpan={3}>
          <VStack alignItems="flex-start" spacing="20px">
            <Center>
              <chakra.h2 fontSize="3xl" fontWeight="700" ml={2}>
                All proposals
              </chakra.h2>
            </Center>
          </VStack>
        </GridItem>
      </Grid>
      <Grid
        templateColumns={{
          base: "repeat(1, 1fr)",
          sm: "repeat(1, 1fr)",
          md: "repeat(1, 1fr)",
        }}
        gap={4}
      >
        <GridItem colSpan={3}>
          {propSignal ? (
            <Tabs>
              <TabList>
                <Tab>Ongoing</Tab>
                <Tab>Upcoming</Tab>
                <Tab>Past</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <TableContainer>
                    <Table variant="simple">
                      <TableCaption>All Proposals</TableCaption>
                      <Thead>
                        <Tr>
                          <Th>Proposal Id.</Th>
                          <Th> Title</Th>
                          <Th>Description</Th>
                          <Th>Votin Token</Th>
                          <Th>Voting Threshold</Th>
                          <Th>Token Address</Th>
                          <Th>Vote</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {proposalArray
                          .filter(
                            (proposal) =>
                              filteringDaos(
                                proposal.proposalInfo.beginningTime,
                                proposal.proposalInfo.endingTime
                              ) == 0
                          )
                          .map((proposal) => (
                            <Tr>
                              <Td>
                                {Number(proposal.proposalInfo.proposalId)}
                              </Td>
                              <Td>{proposal.proposalInfo.proposalTitle}</Td>
                              <Td>
                                {proposal.proposalInfo.proposalDesription}
                              </Td>
                              <Td>{proposal.tokenName}</Td>
                              <Td>
                                {Number(proposal.proposalInfo.votingThreshold) /
                                  1e18}{" "}
                                {proposal.tokenSymbol}
                              </Td>
                              <Td>
                                {proposal.proposalInfo.votingTokenAddress}
                              </Td>
                              <Td>
                                <Button
                                  onClick={() => {
                                    setProposalForVote(
                                      Number(proposal.proposalInfo.proposalId)
                                    );
                                    handleSizeClick2();
                                  }}
                                >
                                  Vote Now
                                </Button>
                              </Td>
                            </Tr>
                          ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </TabPanel>
                <TabPanel>
                  <TableContainer>
                    <Table variant="simple">
                      <TableCaption>All Proposals</TableCaption>
                      <Thead>
                        <Tr>
                          <Th>Proposal Id.</Th>
                          <Th> Title</Th>
                          <Th>Description</Th>
                          <Th>Votin Token</Th>
                          <Th>Voting Threshold</Th>
                          <Th>Token Address</Th>
                          <Th>Start Voting</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {proposalArray
                          .filter(
                            (proposal) =>
                              filteringDaos(
                                proposal.proposalInfo.beginningTime,
                                proposal.proposalInfo.endingTime
                              ) == -1
                          )
                          .map((proposal) => (
                            <Tr>
                              <Td>
                                {Number(proposal.proposalInfo.proposalId)}
                              </Td>
                              <Td>{proposal.proposalInfo.proposalTitle}</Td>
                              <Td>
                                {proposal.proposalInfo.proposalDesription}
                              </Td>
                              <Td>{proposal.tokenName}</Td>
                              <Td>
                                {Number(proposal.proposalInfo.votingThreshold)}{" "}
                                {proposal.tokenSymbol}
                              </Td>
                              <Td>
                                {proposal.proposalInfo.votingTokenAddress}
                              </Td>
                            </Tr>
                          ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </TabPanel>
                <TabPanel>
                  <TableContainer>
                    <Table variant="simple">
                      <TableCaption>All Proposals</TableCaption>
                      <Thead>
                        <Tr>
                          <Th>Proposal Id.</Th>
                          <Th> Title</Th>
                          <Th>Description</Th>
                          <Th>Votin Token</Th>
                          <Th>Voting Threshold</Th>
                          <Th>Token Address</Th>
                          <Th>Results</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {proposalArray
                          .filter(
                            (proposal) =>
                              filteringDaos(
                                proposal.proposalInfo.beginningTime,
                                proposal.proposalInfo.endingTime
                              ) == 1
                          )
                          .map((proposal) => (
                            <Tr>
                              <Td>
                                {Number(proposal.proposalInfo.proposalId)}
                              </Td>
                              <Td>{proposal.proposalInfo.proposalTitle}</Td>
                              <Td>
                                {proposal.proposalInfo.proposalDesription}
                              </Td>
                              <Td>{proposal.tokenName}</Td>
                              <Td>
                                {Number(proposal.proposalInfo.votingThreshold)}{" "}
                                {proposal.tokenSymbol}
                              </Td>
                              <Td>
                                {proposal.proposalInfo.governanceTokenAddress}
                              </Td>
                              <Td>
                                <Button
                                  onClick={() => {
                                    getVotingResults(
                                      Number(proposal.proposalInfo.proposalId)
                                    );
                                    handleSizeClick4();
                                  }}
                                >
                                  View Results
                                </Button>
                              </Td>
                            </Tr>
                          ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </TabPanel>
              </TabPanels>
            </Tabs>
          ) : (
            <Center>
              <Button mt={6} onClick={loadAllProposals}>
                Load Proposals
              </Button>
            </Center>
          )}
        </GridItem>
      </Grid>

      <Modal isOpen={isAddOpen} onClose={onAddClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Proposal</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mr="5%" isRequired>
              <FormLabel htmlFor="subject" fontWeight={"normal"}>
                Proposal Title
              </FormLabel>
              <Input
                id="subject"
                placeholder="Enter Proposal Title"
                onChange={(e) => setTitle(e.target.value)}
              />
            </FormControl>
            <FormControl mt={1} isRequired>
              <FormLabel
                fontSize="sm"
                fontWeight="md"
                color="gray.700"
                _dark={{
                  color: "gray.50",
                }}
              >
                Proposal Description
              </FormLabel>
              <Textarea
                placeholder="Write a short description for proposal"
                rows={3}
                shadow="sm"
                focusBorderColor="brand.400"
                fontSize={{
                  sm: "sm",
                }}
                onChange={(e) => setDescription(e.target.value)}
              />
              <FormHelperText>Short desc. URLs are hyperlinked.</FormHelperText>
            </FormControl>
            <FormControl mr="2%" mt="2%" isRequired>
              <FormLabel htmlFor="name" fontWeight={"normal"}>
                Voting Threshold
              </FormLabel>
              <Input
                id="threshholdToken"
                placeholder="Enter Minimum tokens required to vote"
                autoComplete="email"
                onChange={(e) => setVotingThreshold(e.target.value)}
              />
            </FormControl>
            <FormControl mr="2%" mt="2%" isRequired>
              <FormLabel htmlFor="name" fontWeight={"normal"}>
                Passing Threshold
              </FormLabel>
              <Input
                id="threshholdToken"
                placeholder="Enter Minimum tokens required to pass proposal"
                autoComplete="email"
                onChange={(e) => setPassingThreshold(e.target.value)}
              />
              <FormHelperText>
                Enter minimum number of votes to pass a proposal
              </FormHelperText>
            </FormControl>
            <FormControl mr="2%" mt="2%" isRequired>
              <FormLabel htmlFor="name" fontWeight={"normal"}>
                Token Address
              </FormLabel>
              <Input
                id="tokenAddress"
                placeholder="Token address of proposal token"
                onChange={(e) => setTokenAddress(e.target.value)}
              />
            </FormControl>

            <FormControl mr="5%">
              <FormLabel
                htmlFor="datetime-local"
                fontWeight={"normal"}
                isRequired
              >
                Voting Start Date
              </FormLabel>
              <Input
                placeholder="Select Date "
                size="md"
                type="date"
                id="datetime-local"
                onChange={(e) => {
                  setStartDate(convertToEpoch(e.target.value) as any);
                }}
              />
            </FormControl>

            <FormControl mr="5%">
              <FormLabel
                htmlFor="datetime-local"
                fontWeight={"normal"}
                isRequired
              >
                Voting End Date
              </FormLabel>
              <Input
                placeholder="Select Date and Time"
                size="md"
                type="date"
                id="datetime-local"
                onChange={(e) => {
                  setEndTime(convertToEpoch(e.target.value) as any);
                }}
              />
            </FormControl>
            <FormControl mr="5%" mt="3%" isRequired>
              <FormLabel htmlFor="first-name" fontWeight={"normal"}>
                Allow voting only once
              </FormLabel>
              <RadioGroup defaultValue="2">
                <Stack spacing={5} direction="row">
                  <Radio
                    colorScheme="red"
                    value="1"
                    onChange={() => setvoteOnce(false)}
                  >
                    No
                  </Radio>
                  <Radio
                    colorScheme="green"
                    value="2"
                    onChange={() => setvoteOnce(true)}
                  >
                    Yes
                  </Radio>
                </Stack>
              </RadioGroup>
            </FormControl>
            <FormControl mr="5%" mt="3%" isRequired>
              <FormLabel
                htmlFor="specialization"
                fontSize="sm"
                fontWeight="md"
                color="gray.700"
                _dark={{
                  color: "gray.50",
                }}
              >
                Proposal Type
              </FormLabel>
              <Select
                id="specialization"
                name="specialization"
                autoComplete="specialization"
                placeholder="Select option"
                focusBorderColor="brand.400"
                shadow="sm"
                size="sm"
                w="full"
                rounded="md"
                onChange={(e) => setProposalType(e.target.value)}
              >
                <option value="1">Standard Voting</option>
                <option value="2">Quadratic Voting</option>
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => addProposal()}>Submit</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={isVoteOpen} onClose={onVoteClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Cast Your Vote</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Select
              onChange={(e) => {
                setUserResponse(e.target.value);
              }}
              placeholder="Select option"
            >
              <option value={1}>Yes</option>
              <option value={2}>No</option>
              <option value={3}>Abstain</option>
            </Select>
          </ModalBody>
          <Text ml={7} mt={2}>
            Please Authorize first and wait for the transaction to end. Then
            press Submit
          </Text>
          <ModalFooter>
            <Button
              onClick={() => {
                console.log(userResponse);
                console.log(proposalForVote);
                authorizeContract();
              }}
              colorScheme="orange"
              m={2}
            >
              Authorize & Vote
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={isStartOpen} onClose={onStartClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Invite member to dao:</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              type="text"
              placeholder="Add wallet address of the user you want to invite to DAO"
              onChange={(e) => {
                setInviteAddress(e.target.value);
              }}
            />
          </ModalBody>
          <ModalFooter>
            <Button>Submit</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={isEndOpen} onClose={onEndClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Voting Results: </ModalHeader>
          <ModalBody>
            {/* <TableContainer>
              <Table variant="simple">
                <Tr>
                  <Td>Yes</Td>
                  <Td isNumeric>{votingYes}</Td>
                </Tr>
                <Tr>
                  <Td>No</Td>
                  <Td isNumeric>{votingNo}</Td>
                </Tr>
                <Tr>
                  <Td>Final Verdict</Td>
                  <Td isNumeric>{finalVerdict}</Td>
                </Tr>
              </Table>
            </TableContainer> */}
          </ModalBody>
          <ModalCloseButton />
        </ModalContent>
      </Modal>
    </div>
  );
};

export default index;
