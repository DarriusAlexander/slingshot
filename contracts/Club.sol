pragma solidity >= 0.6.2 < 0.7.0;

/*
This contract:
- Holds reward funds
- List of club meetings
- Is called for creating new meeting contracts although the deployer contract ultimately deploys these meetings.
- This contract and only this contract is able to change the owner for each meeting contract.
	- This is done through an 80% (round up) quorum of an unlimited list of admins. 
	- Would need a list of admins
	- Meeting contract would have a change owner function that can only be called by this contract.
	- There would also be a list of legitimate meeting contracts that can request money from this contract.
	- The function to change the owner of any meeting would need to have the meeting address and the new owner address. 

	So this could be done in two ways:
		1. Proposals that are then voted on.
			This would mean any admin creates a suggested transaction and it must be approved by 80% for the tx to be sent.

		2. Simply a large mapping that shows the current selected owner for each meeting contract for each admin. This would take up a lot of storage.

- At the end of each meeting any left over stake is sent here or some balance sent from here to pay off each contract.

- ETH calculation and transfer must happen atomically. 

- Constructor deploys a new meeting.




So deployer deploys this contract only and then interactions for that club are either with this contract or it's children meeting contracts.


Deployers and payout functions should be limited in some way.
	- Payout function should clearly only occur after being called by meeting contract.
	- Deployer function should only be called by a current event admin
		- If any admin can deploy, that means that any admin could potentially quickly create an event, use fake users to conclude the event and then take the payout for themselves.
		- The original idea was to separate the meeting owner from superadmins.
		- I guess, in the proposal function you could stop the owner from voting and make the threshold 80% of total-1.
		- However, that requires knowing the old owner in this contract which we don't know. I guess you can easily find it out though.


So we want any admin function to basically require the same function to be called by a certain number of admins. I guess you could just create a voting pannel which can tell 


- Any admin on the multisig can create new meetings. But actually we really just want one organiser who's creating the meetings who can then be deleted if need be.

- So we could create a list of Admins that are able to create events in addition to the admin of each event. 

*/


import './Meeting.sol';

contract Club{

	event NewMeetingEvent(address ownerAddr, address contractAddr);
	event ProposalExecuted(address target, address[] addAdmins, address[] removeAdmins);
	event ProposeAdminChange(address target, address[] addAdmins, address[] removeAdmins);
	event ApproveProposal(uint proposal);


	mapping (address => bool) isMeeting; //Records legitimate meeting addresses

	mapping (address => bool) isAdmin; //Records list of admins who can create new meetings

	uint public totalAdmins;

	struct Proposal{
		address target;
		address[] addAdmins;
		address[] removeAdmins;
		uint totalInFavour;
		mapping(address => bool) isInFavour;
		uint32 creationTime;
	}

	mapping (uint => Proposal) proposal;

	uint public proposalCounter;

	modifier onlyAdmin(){
		require(isAdmin[msg.sender] == true);
		_;
	}

	constructor (){
		isAdmin[msg.sender] = true;
		totalAdmins = 1;
	}

	receive() external payable {}


	function deployMeeting(uint _startDate, uint _endDate, uint _minStake, uint _registrationLimit) external onlyAdmin {
		address memory meeting = address(new Meeting(_startDate, _endDate, _minStake, _registrationLimit, address(this), msg.sender));
		isMeeting[meeting] = true;
		emit NewMeetingEvent(msg.sender, meeting);
		return meeting;
	}

	function poolPayout(uint _amount) external payable {
		require (isMeeting[msg.sender] = true, 'Not a meeting or already paid out');
		if (_amount != 0){
			msg.sender.transfer(_amount);
		}

		isMeeting[msg.sender] = false;
		emit PoolPayout(_amount);
	}

	function getBalance() external view returns (uint){
        return address(this).balance;
    }
 

	function approveProposal(uint _proposal) external onlyAdmin {
		require (proposal[_proposal].isInFavour[msg.sender] == false, 'Already approved');
		proposal[_proposal].isInFavour[msg.sender] = true;
		proposal[_proposal].totalInFavour++;
		emit ApproveProposal(_proposal);
	}


	function executeProposal(uint _proposal) external onlyAdmin {
		//Check vote totals
		Proposal memory p = proposal[_proposal];
		require(now < p.creationTime + 7 days, 'proposal expired'); //Proposal expires after 7 days.
		require(p.totalInFavour.mul(5) >= totalAdmins.mul(4), 'Quorum not reached'); //Require at least 4/5 admins to approve proposal.  

		if (p.target == address(this)){
			for (uint i=0; i<p.addAdmins.length; i++) {
				isAdmin[p.addAdmins[i]] = true;
			}
			for (uint i=0; i<p.removeAdmins.length; i++) {
				isAdmin[p.removeAdmins[i]] = false;
			}
			totalAdmins = totalAdmins.add(p.addAdmins.length).sub(p.removeAdmins.length);

		} else{
			Meeting(p.target).transferOwnership(p.addAdmins[0]); //Meeting ownership transferred.
		}
		emit ProposalExecuted(p.target, p.addAdmins, p.removeAdmins);
		

	}

	function proposeAdminChange(address _target, address[] _addAdmins, address[] _removeAdmins) external onlyAdmin{
		//Store proposal
		proposal[++proposalCounter] = Proposal({
			target: _target,
			addAdmins: _addAdmins,
			removeAdmins: _removeAdmins,
			creationTime: now});
		emit ProposeAdminChange(_target, _addAdmins, _removeAdmins);	
	}


	//Any admin can block a payout. This is reasonable since the admin would not do this unless necessary since others can get rid of them.
	function pauseMeeting(address _meeting, uint _duration) external onlyAdmin {
		//Stops all functions in the _meeting contract for _duration amount of time.
		require(_duration < 7 days);

	}

}