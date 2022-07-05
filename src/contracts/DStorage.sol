pragma solidity ^0.5.0;

contract DStorage {
  string public name = 'DStorage';
  uint public fileCount = 0;
  mapping(uint => File) public files;

  struct File {
    uint fileId;
    string fileHash;
    uint fileSize;
    string fileType;
    string fileName;
    string fileDescription;
    bool isSubscribed;
    bool isOwned;
    uint uploadTime;
    address payable uploader;
  }

  event FileUploaded(
    uint fileId,
    string fileHash,
    uint fileSize,
    string fileType,
    string fileName, 
    string fileDescription,
    bool isSubscribed,
    bool isOwned,
    uint uploadTime,
    address payable uploader
  );

  constructor() public {
  }

  function subscribe_item(uint item_id) public  returns(bool) {

      for (uint i = fileCount; i >= 1; i--) {
        if(files[i].fileId==item_id)
        {
          files[i].isSubscribed=false;
          return true;
        }
    }

    return false;
    
  }

 function open_file(uint file_id) public view returns(string memory) {
      for (uint i = fileCount; i >= 1; i--) {
        if(files[i].fileId==file_id)
        {
          return files[i].fileHash;
        }
    }

    revert('Not found');
    
  }
 
  function uploadFile(string memory _fileHash, uint _fileSize, string memory _fileType, string memory _fileName, string memory _fileDescription) public {
    // Make sure the file hash exists
    require(bytes(_fileHash).length > 0);
    // Make sure file type exists
    require(bytes(_fileType).length > 0);
    // Make sure file description exists
    require(bytes(_fileDescription).length > 0);
    // Make sure file fileName exists
    require(bytes(_fileName).length > 0);
    // Make sure uploader address exists
    require(msg.sender!=address(0));
    // Make sure file size is more than 0
    require(_fileSize>0);

    // Increment file id
    fileCount ++;

    // Add File to the contract
    files[fileCount] = File(fileCount, _fileHash, _fileSize, _fileType, _fileName, _fileDescription,true,true,now, msg.sender);
    // Trigger an event
    emit FileUploaded(fileCount, _fileHash, _fileSize, _fileType, _fileName, _fileDescription,true,true,now, msg.sender);
  }

  function own_File(uint item_id) public returns(bool) {

      for (uint i = fileCount; i >= 1; i--) {
        if(files[i].fileId==item_id)
        {
          files[i].isOwned=false;

          return true;
        }
    }

    return false; 
  }
}

