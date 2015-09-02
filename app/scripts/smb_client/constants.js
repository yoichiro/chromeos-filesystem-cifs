(function() {

    "use strict";

    // Constructor

    var Constants = function() {
    };

    // Constants

    Constants.READ_ANDX_BUFFER_SIZE = 8192 * 7;
    Constants.SMB2_READ_BUFFER_SIZE = 8192 * 7;
    Constants.TRANSACTION_BUFFER_SIZE = 1024;
    Constants.TRANSACTION_MAX_APPEND_READ_SIZE = 65535;
    Constants.SMB2_HEADER_SIZE = 64;

    // - Protocol Version
    Constants.PROTOCOL_VERSION_UNKNOWN = 0;
    Constants.PROTOCOL_VERSION_SMB1 = 1;
    Constants.PROTOCOL_VERSION_SMB2 = 2;

    // - Dialect

    Constants.DIALECT_NT_LM_0_12 = "NT LM 0.12";
    Constants.DIALECT_SMB_2_002 = "SMB 2.002";
    Constants.NO_SUPPORTED_DIALECT = 65535;
    Constants.DIALECT_SMB_2_002_REVISION = 0x0202;

    // - Command

    Constants.SMB_COM_ECHO = 0x2b;
    Constants.SMB_COM_NEGOTIATE = 0x72;
    Constants.SMB_COM_SESSION_SETUP_ANDX = 0x73;
    Constants.SMB_COM_TREE_CONNECT_ANDX = 0x75;
    Constants.SMB_COM_NT_CREATE_ANDX = 0xa2;
    Constants.SMB_COM_TRANSACTION = 0x25;
    Constants.SMB_COM_CLOSE = 0x04;
    Constants.SMB_COM_TRANSACTION2 = 0x32;
    Constants.SMB_COM_FIND_CLOSE2 = 0x34;
    Constants.SMB_COM_SEEK = 0x12;
    Constants.SMB_COM_READ_ANDX = 0x2e;
    Constants.SMB_COM_WRITE_ANDX = 0x2f;
    Constants.SMB_COM_DELETE = 0x06;
    Constants.SMB_COM_DELETE_DIRECTORY = 0x01;
    Constants.SMB_COM_RENAME = 0x07;
    Constants.SMB_COM_TREE_DISCONNECT = 0x71;
    Constants.SMB_COM_LOGOFF_ANDX = 0x74;
    
    Constants.SMB2_SESSION_SETUP = 0x0001;
    Constants.SMB2_TREE_CONNECT = 0x0003;
    Constants.SMB2_CREATE = 0x0005;
    Constants.SMB2_IOCTL = 0x000b;
    Constants.SMB2_CLOSE = 0x0006;
    Constants.SMB2_TREE_DISCONNECT = 0x0004;
    Constants.SMB2_LOGOFF = 0x0002;
    Constants.SMB2_QUERY_INFO = 0x0010;
    Constants.SMB2_QUERY_DIRECTORY_INFO = 0x000e;
    Constants.SMB2_READ = 0x0008;
    Constants.SMB2_WRITE = 0x0009;
    Constants.SMB2_SET_INFO = 0x0011;

    // - Sub Command
    Constants.TRANS2_QUERY_PATH_INFORMATION = 0x0005;
    Constants.TRANS2_FIND_FIRST2 = 0x0001;
    Constants.TRANS2_FIND_NEXT2 = 0x0002;
    Constants.TRANS2_CREATE_DIRECTORY = 0x000d;

    // - NBT Type
    Constants.NBT_SESSION_KEEPALIVE = 0x85;

    // - Flag
    Constants.SMB_FLAGS_SERVER_TO_REDIR = 0x80; // 0: request 1: reply
    Constants.SMB_FLAGS_REQUEST_BATCH_OPLOCK = 0x40; // 0: Exclusive 1: Batch
    Constants.SMB_FLAGS_REQUEST_OPLOCK = 0x20; // 0: no OpLock 1: OpLock
    Constants.SMB_FLAGS_CANONICAL_PATHNAMES = 0x10; // 0: Host format 1: Canonical
    Constants.SMB_FLAGS_CASELESS_PATHNAMES = 0x08; // 0: case-sensitive 1: caseless
    Constants.SMB_FLAGS_CLIENT_BUF_AVAIL = 0x02; // 0: Not posted 1: Buffer posted
    Constants.SMB_FLAGS_SUPPORT_LOCKREAD = 0x01; // 0: Not supported 1: Supported
    
    Constants.SMB2_FLAGS_SERVER_TO_REDIR = 0x00000001;
    Constants.SMB2_FLAGS_ASYNC_COMMAND = 0x00000002;
    Constants.SMB2_FLAGS_RELATED_OPERATIONS = 0x00000004;
    Constants.SMB2_FLAGS_SIGNED = 0x00000008;
    Constants.SMB2_FLAGS_PRIORITY_MASK = 0x00000070;
    Constants.SMB2_FLAGS_DFS_OPERATIONS = 0x10000000;
    Constants.SMB2_FLAGS_REPLAY_OPERATION = 0x20000000;

    // - Flag2
    Constants.SMB_FLAGS2_UNICODE_STRINGS = 0x8000; // 0:ASCII 1:Unicode
    Constants.SMB_FLAGS2_32BIT_STATUS = 0x4000; // 0:DOS error code 1:NT_STATUS code
    Constants.SMB_FLAGS2_READ_IF_EXECUTE = 0x2000; // 0: Execute != Read 1: Execute confers Read
    Constants.SMB_FLAGS2_DFS_PATHNAME = 0x1000; // 0: Normal pathname 1: DFS pathname
    Constants.SMB_FLAGS2_EXTENDED_SECURITY = 0x0800; // 0: Normal security 1: Extended security
    Constants.SMB_FLAGS2_IS_LONG_NAME = 0x0040; // 0: 8.3 format 1: Long names
    Constants.SMB_FLAGS2_SECURITY_SIGNATURE = 0x0004; // 0: No signature 1: Message Authentication Codes
    Constants.SMB_FLAGS2_EAS = 0x0002; // 0: No EAs 1: Extended Attributes
    Constants.SMB_FLAGS2_KNOWS_LONG_NAMES = 0x0001; // 0: Client wants 8.3 1: Long pathnames okay

    // - Security mode
    Constants.NEGOTIATE_SECURITY_SIGNATURES_REQUIRED = 0x08;
    Constants.NEGOTIATE_SECURITY_SIGNATURES_ENABLED = 0x04;
    Constants.NEGOTIATE_SECURITY_CHALLENGE_RESPONSE = 0x02;
    Constants.NEGOTIATE_SECURITY_USER_LEVEL = 0x01;

    // -- Capabilities
    Constants.CAP_EXTENDED_SECURITY = 0x80000000;
    Constants.CAP_COMPRESSED_DATA = 0x40000000;
    Constants.CAP_BULK_TRANSFER = 0x20000000;
    Constants.CAP_UNIX = 0x00800000;
    Constants.CAP_LARGE_WRITEX = 0x00008000;
    Constants.CAP_LARGE_READX = 0x00004000;
    Constants.CAP_INFOLEVEL_PASSTHROUGH = 0x00002000;
    Constants.CAP_DFS = 0x00001000;
    Constants.CAP_NT_FIND = 0x00000200;
    Constants.CAP_LOCK_AND_READ = 0x00000100;
    Constants.CAP_LEVEL_II_OPLOCKS = 0x00000080;
    Constants.CAP_STATUS32 = 0x00000040;
    Constants.CAP_RPC_REMOTE_APIS = 0x00000020;
    Constants.CAP_NT_SMBS = 0x00000010;
    Constants.CAP_LARGE_FILES = 0x00000008;
    Constants.CAP_UNICODE = 0x00000004;
    Constants.CAP_MPX_MODE = 0x00000002;
    Constants.CAP_RAW_MODE = 0x00000001;

    // -- NTLM Flags
    Constants.NTLMSSP_NEGOTIATE_UNICODE = 0x00000001;
    Constants.NTLMSSP_NEGOTIATE_OEM = 0x00000002;
    Constants.NTLMSSP_REQUEST_TARGET = 0x00000004;
    Constants.NTLMSSP_NEGOTIATE_SIGN = 0x00000010;
    Constants.NTLMSSP_NEGOTIATE_SEAL = 0x00000020;
    Constants.NTLMSSP_NEGOTIATE_DATAGRAM_STYLE = 0x00000040;
    Constants.NTLMSSP_NEGOTIATE_LM_KEY = 0x00000080;
    Constants.NTLMSSP_NEGOTIATE_NETWARE = 0x00000100;
    Constants.NTLMSSP_NEGOTIATE_NTLM = 0x00000200;
    Constants.NTLMSSP_NEGOTIATE_OEM_DOMAIN_SUPPLIED = 0x00001000;
    Constants.NTLMSSP_NEGOTIATE_OEM_WORKSTATION_SUPPLIED = 0x00002000;
    Constants.NTLMSSP_NEGOTIATE_LOCAL_CALL = 0x00004000;
    Constants.NTLMSSP_NEGOTIATE_ALWAYS_SIGN = 0x00008000;
    Constants.NTLMSSP_TARGET_TYPE_DOMAIN = 0x00010000;
    Constants.NTLMSSP_TARGET_TYPE_SERVER = 0x00020000;
    Constants.NTLMSSP_TARGET_TYPE_SHARE = 0x00040000;
    Constants.NTLMSSP_NEGOTIATE_NTLM2 = 0x00080000;
    Constants.NTLMSSP_REQUEST_INIT_RESPONSE = 0x00100000;
    Constants.NTLMSSP_REQUEST_ACCEPT_RESPONSE = 0x00200000;
    Constants.NTLMSSP_REQUEST_NON_NT_SESSION_KEY = 0x00400000;
    Constants.NTLMSSP_NEGOTIATE_TARGET_INFO = 0x00800000;
    Constants.NTLMSSP_NEGOTIATE_128 = 0x20000000;
    Constants.NTLMSSP_NEGOTIATE_KEY_EXCH = 0x40000000;
    Constants.NTLMSSP_NEGOTIATE_56 = 0x80000000;

    // -- NT Status Codes
    Constants.NT_STATUS_OK = 0x00000000;
    Constants.NT_STATUS_UNSUCCESSFUL = 0xC0000001;
    Constants.NT_STATUS_NOT_IMPLEMENTED = 0xC0000002;
    Constants.NT_STATUS_INVALID_INFO_CLASS = 0xC0000003;
    Constants.NT_STATUS_ACCESS_VIOLATION = 0xC0000005;
    Constants.NT_STATUS_INVALID_HANDLE = 0xC0000008;
    Constants.NT_STATUS_INVALID_PARAMETER = 0xC000000d;
    Constants.NT_STATUS_NO_SUCH_DEVICE = 0xC000000e;
    Constants.NT_STATUS_NO_SUCH_FILE = 0xC000000f;
    Constants.NT_STATUS_MORE_PROCESSING_REQUIRED = 0xC0000016;
    Constants.NT_STATUS_ACCESS_DENIED = 0xC0000022;
    Constants.NT_STATUS_BUFFER_TOO_SMALL = 0xC0000023;
    Constants.NT_STATUS_OBJECT_NAME_INVALID = 0xC0000033;
    Constants.NT_STATUS_OBJECT_NAME_NOT_FOUND = 0xC0000034;
    Constants.NT_STATUS_OBJECT_NAME_COLLISION = 0xC0000035;
    Constants.NT_STATUS_PORT_DISCONNECTED = 0xC0000037;
    Constants.NT_STATUS_OBJECT_PATH_INVALID = 0xC0000039;
    Constants.NT_STATUS_OBJECT_PATH_NOT_FOUND = 0xC000003a;
    Constants.NT_STATUS_OBJECT_PATH_SYNTAX_BAD = 0xC000003b;
    Constants.NT_STATUS_SHARING_VIOLATION = 0xC0000043;
    Constants.NT_STATUS_DELETE_PENDING = 0xC0000056;
    Constants.NT_STATUS_NO_LOGON_SERVERS = 0xC000005e;
    Constants.NT_STATUS_USER_EXISTS = 0xC0000063;
    Constants.NT_STATUS_NO_SUCH_USER = 0xC0000064;
    Constants.NT_STATUS_WRONG_PASSWORD = 0xC000006a;
    Constants.NT_STATUS_LOGON_FAILURE = 0xC000006d;
    Constants.NT_STATUS_ACCOUNT_RESTRICTION = 0xC000006e;
    Constants.NT_STATUS_INVALID_LOGON_HOURS = 0xC000006f;
    Constants.NT_STATUS_INVALID_WORKSTATION = 0xC0000070;
    Constants.NT_STATUS_PASSWORD_EXPIRED = 0xC0000071;
    Constants.NT_STATUS_ACCOUNT_DISABLED = 0xC0000072;
    Constants.NT_STATUS_NONE_MAPPED = 0xC0000073;
    Constants.NT_STATUS_INVALID_SID = 0xC0000078;
    Constants.NT_STATUS_INSTANCE_NOT_AVAILABLE = 0xC00000ab;
    Constants.NT_STATUS_PIPE_NOT_AVAILABLE = 0xC00000ac;
    Constants.NT_STATUS_INVALID_PIPE_STATE = 0xC00000ad;
    Constants.NT_STATUS_PIPE_BUSY = 0xC00000ae;
    Constants.NT_STATUS_PIPE_DISCONNECTED = 0xC00000b0;
    Constants.NT_STATUS_PIPE_CLOSING = 0xC00000b1;
    Constants.NT_STATUS_PIPE_LISTENING = 0xC00000b3;
    Constants.NT_STATUS_FILE_IS_A_DIRECTORY = 0xC00000ba;
    Constants.NT_STATUS_DUPLICATE_NAME = 0xC00000bd;
    Constants.NT_STATUS_NETWORK_NAME_DELETED = 0xC00000c9;
    Constants.NT_STATUS_NETWORK_ACCESS_DENIED = 0xC00000ca;
    Constants.NT_STATUS_BAD_NETWORK_NAME = 0xC00000cc;
    Constants.NT_STATUS_REQUEST_NOT_ACCEPTED = 0xC00000d0;
    Constants.NT_STATUS_CANT_ACCESS_DOMAIN_INFO = 0xC00000da;
    Constants.NT_STATUS_NO_SUCH_DOMAIN = 0xC00000df;
    Constants.NT_STATUS_NOT_A_DIRECTORY = 0xC0000103;
    Constants.NT_STATUS_CANNOT_DELETE = 0xC0000121;
    Constants.NT_STATUS_INVALID_COMPUTER_NAME = 0xC0000122;
    Constants.NT_STATUS_PIPE_BROKEN = 0xC000014b;
    Constants.NT_STATUS_NO_SUCH_ALIAS = 0xC0000151;
    Constants.NT_STATUS_LOGON_TYPE_NOT_GRANTED = 0xC000015b;
    Constants.NT_STATUS_NO_TRUST_SAM_ACCOUNT = 0xC000018b;
    Constants.NT_STATUS_TRUSTED_DOMAIN_FAILURE = 0xC000018c;
    Constants.NT_STATUS_NOLOGON_WORKSTATION_TRUST_ACCOUNT = 0xC0000199;
    Constants.NT_STATUS_PASSWORD_MUST_CHANGE = 0xC0000224;
    Constants.NT_STATUS_NOT_FOUND = 0xC0000225;
    Constants.NT_STATUS_ACCOUNT_LOCKED_OUT = 0xC0000234;
    Constants.NT_STATUS_PATH_NOT_COVERED = 0xC0000257;
    Constants.NT_STATUS_IO_REPARSE_TAG_NOT_HANDLED = 0xC0000279;
    Constants.NT_STATUS_END_OF_FILE = 0xC0000011;

    // -- DCERPC ERROR CODEs
    Constants.STATUS_BUFFER_OVERFLOW = 0x80000005;
    
    // -- SMB2 STATUS CODEs
    Constants.SMB2_STATUS_NO_MORE_FILES = 0x80000006;

    // -- SMB_COM_NT_CREATE_ANDX Flags
    Constants.NT_CREATE_REQUEST_OPLOCK = 0x00000002; // If set, the client requests an exclusive OpLock.
    Constants.NT_CREATE_REQUEST_OPBATCH = 0x00000004; // If set, the client requests an exclusive batch OpLock.
    Constants.NT_CREATE_OPEN_TARGET_DIR = 0x00000008; // If set, the client indicates that the parent directory of the target is to be opened.

    // -- SMB_COM_NT_CREATE_ANDX, SMB2_CREATE DesiredAccess
    Constants.FILE_READ_DATA = 0x00000001; // Indicates the right to read data from the file.
    Constants.FILE_LIST_DIRECTORY = 0x00000001;
    Constants.FILE_WRITE_DATA = 0x00000002; // Indicates the right to write data into the file beyond the end of the file.
    Constants.FILE_ADD_FILE = 0x00000002;
    Constants.FILE_APPEND_DATA = 0x00000004; // Indicates the right to append data to the file beyond the end of the file only.
    Constants.FILE_ADD_SUBDIRECTORY = 0x00000004;
    Constants.FILE_READ_EA = 0x00000008; // Indicates the right to read the extended attributes (EAs) of the file.
    Constants.FILE_WRITE_EA = 0x00000010; // Indicates the right to write or change the extended attributes (EAs) of the file.
    Constants.FILE_EXECUTE = 0x00000020; // Indicates the right to execute the file.
    Constants.FILE_TRAVERSE = 0x00000020;
    Constants.FILE_DELETE_CHILD = 0x00000040;
    Constants.FILE_READ_ATTRIBUTES = 0x00000080; // Indicates the right to read the attributes of the file.
    Constants.FILE_WRITE_ATTRIBUTES = 0x00000100; // Indicates the right to change the attributes of the file.
    Constants.DELETE = 0x00010000; // Indicates the right to delete or to rename the file.
    Constants.READ_CONTROL = 0x00020000; // Indicates the right to read the security descriptor of the file.
    Constants.WRITE_DAC = 0x00040000; // Indicates the right to change the discretionary access control list (DACL) in the security descriptor of the file.
    Constants.WRITE_OWNER = 0x00080000; // Indicates the right to change the owner in the security descriptor of the file.
    Constants.SYNCHRONIZE = 0x00100000; // SHOULD NOT be used by the sender and MUST be ignored by the receiver.
    Constants.ACCESS_SYSTEM_SECURITY = 0x01000000; // Indicates the right to read or change the system access control list (SACL) in the security descriptor for the file. If the SE_SECURITY_NAME privilege is not set in the access token, the server MUST fail the open request and return STATUS_PRIVILEGE_NOT_HELD.
    Constants.MAXIMUM_ALLOWED = 0x02000000; // Indicates that the client requests an open to the file with the highest level of access that the client has on this file. If no access is granted for the client on this file, the server MUST fail the open and return a STATUS_ACCESS_DENIED.
    Constants.GENERIC_ALL = 0x10000000; // Indicates a request for all of the access flags that are previously listed except MAXIMUM_ALLOWED and ACCESS_SYSTEM_SECURITY.
    Constants.GENERIC_EXECUTE = 0x20000000; // Indicates a request for the following combination of access flags listed previously in this table: FILE_READ_ATTRIBUTES, FILE_EXECUTE, SYNCHRONIZE, and READ_CONTROL.
    Constants.GENERIC_WRITE = 0x40000000; // Indicates a request for the following combination of access flags listed previously in this table: FILE_WRITE_DATA, FILE_APPEND_DATA, SYNCHRONIZE, FILE_WRITE_ATTRIBUTES, and FILE_WRITE_EA.
    Constants.GENERIC_READ = 0x80000000; // Indicates a request for the following combination of access flags listed previously in this table: FILE_READ_DATA, FILE_READ_ATTRIBUTES, FILE_READ_EA, and SYNCHRONIZE.

    // -- SMB_EXT_FILE_ATTR
    Constants.SMB_EXT_FILE_ATTR_ATTR_READONLY = 0x00000001; // The file is read only. Applications can read the file but cannot write to it or delete it.
    Constants.SMB_EXT_FILE_ATTR_ATTR_HIDDEN = 0x00000002; // The file is hidden. It is not to be included in an ordinary directory listing.
    Constants.SMB_EXT_FILE_ATTR_ATTR_SYSTEM = 0x00000004; // The file is part of or is used exclusively by the operating system.
    Constants.SMB_EXT_FILE_ATTR_ATTR_DIRECTORY = 0x00000010; // The file is a directory.
    Constants.SMB_EXT_FILE_ATTR_ATTR_ARCHIVE = 0x00000020; // The file has not been archived since it was last modified. Applications use this attribute to mark files for backup or removal.
    Constants.SMB_EXT_FILE_ATTR_ATTR_NORMAL = 0x00000080; // The file has no other attributes set. This attribute is valid only if used alone.
    Constants.SMB_EXT_FILE_ATTR_ATTR_TEMPORARY = 0x00000100; // The file is temporary. This is a hint to the cache manager that it does not need to flush the file to backing storage.
    Constants.SMB_EXT_FILE_ATTR_ATTR_COMPRESSED = 0x00000800; // The file or directory is compressed. For a file, this means that all of the data in the file is compressed. For a directory, this means that compression is the default for newly created files and subdirectories.
    Constants.SMB_EXT_FILE_ATTR_POSIX_SEMANTICS = 0x01000000; // Indicates that the file is to be accessed according to POSIX rules. This includes allowing multiple files with names differing only in case, for file systems that support such naming.<15>
    Constants.SMB_EXT_FILE_ATTR_BACKUP_SEMANTICS = 0x02000000; // Indicates that the file is being opened or created for a backup or restore operation. The server SHOULD allow the client to override normal file security checks, provided it has the necessary permission to do so.
    Constants.SMB_EXT_FILE_ATTR_DELETE_ON_CLOSE = 0x04000000; // Requests that the server delete the file immediately after all of its handles have been closed.
    Constants.SMB_EXT_FILE_ATTR_SEQUENTIAL_SCAN = 0x08000000; // Indicates that the file is to be accessed sequentially from beginning to end.<16>
    Constants.SMB_EXT_FILE_ATTR_RANDOM_ACCESS = 0x10000000; // Indicates that the application is designed to access the file randomly. The server can use this flag to optimize file caching.
    Constants.SMB_EXT_FILE_ATTR_NO_BUFFERING = 0x20000000; // Requests that the server open the file with no intermediate buffering or caching; the server might not honor the request. The application MUST meet certain requirements when working with files opened with FILE_FLAG_NO_BUFFERING. File access MUST begin at offsets within the file that are integer multiples of the volume's sector size and MUST be for numbers of bytes that are integer multiples of the volume's sector size. For example, if the sector size is 512 bytes, an application can request reads and writes of 512, 1024, or 2048 bytes, but not of 335, 981, or 7171 bytes.
    Constants.SMB_EXT_FILE_ATTR_WRITE_THROUGH = 0x80000000; // Instructs the operating system to write through any intermediate cache and go directly to the file. The operating system can still cache write operations, but cannot lazily flush them.

    // -- SMB2 FileAttributes
    Constants.SMB2_FILE_ATTRIBUTE_READONLY = 0x00000001; // A file or directory that is read-only. For a file, applications can read the file but cannot write to it or delete it. For a directory, applications cannot delete it, but applications can create and delete files from that directory.
    Constants.SMB2_FILE_ATTRIBUTE_HIDDEN = 0x00000002; // A file or directory that is hidden. Files and directories marked with this attribute do not appear in an ordinary directory listing.
    Constants.SMB2_FILE_ATTRIBUTE_SYSTEM = 0x00000004; // A file or directory that the operating system uses a part of or uses exclusively.
    Constants.SMB2_FILE_ATTRIBUTE_DIRECTORY = 0x00000010; // This item is a directory.
    Constants.SMB2_FILE_ATTRIBUTE_ARCHIVE = 0x00000020; // A file or directory that requires to be archived. Applications use this attribute to mark files for backup or removal.
    Constants.SMB2_FILE_ATTRIBUTE_NORMAL = 0x00000080; // A file that does not have other attributes set. This flag is used to clear all other flags by specifying it with no other flags set. This flag MUST be ignored if other flags are set.<159>
    Constants.SMB2_FILE_ATTRIBUTE_TEMPORARY = 0x00000100; // A file that is being used for temporary storage. The operating system may choose to store this file's data in memory rather than on mass storage, writing the data to mass storage only if data remains in the file when the file is closed.
    Constants.SMB2_FILE_ATTRIBUTE_SPARSE_FILE = 0x00000200; // A file that is a sparse file.
    Constants.SMB2_FILE_ATTRIBUTE_REPARSE_POINT = 0x00000400; // A file or directory that has an associated reparse point.
    Constants.SMB2_FILE_ATTRIBUTE_COMPRESSED = 0x00000800; // A file or directory that is compressed. For a file, all of the data in the file is compressed. For a directory, compression is the default for newly created files and subdirectories.
    Constants.SMB2_FILE_ATTRIBUTE_OFFLINE = 0x00001000; // The data in this file is not available immediately. This attribute indicates that the file data is physically moved to offline storage. This attribute is used by Remote Storage, which is hierarchical storage management software.
    Constants.SMB2_FILE_ATTRIBUTE_NOT_CONTENT_INDEXED = 0x00002000; // A file or directory that is not indexed by the content indexing service.
    Constants.SMB2_FILE_ATTRIBUTE_ENCRYPTED = 0x00004000; // A file or directory that is encrypted. For a file, all data streams in the file are encrypted. For a directory, encryption is the default for newly created files and subdirectories.
    Constants.SMB2_FILE_ATTRIBUTE_INTEGRITY_STREAM = 0x00008000; // A file or directory that is configured with integrity support. For a file, all data streams in the file have integrity support. For a directory, integrity support is the default for newly created files and subdirectories, unless the caller specifies otherwise.<160>
    Constants.SMB2_FILE_ATTRIBUTE_NO_SCRUB_DATA = 0x00020000; // A file or directory that is configured to be excluded from the data integrity scan. For a directory configured with FILE_ATTRIBUTE_NO_SCRUB_DATA, the default for newly created files and subdirectories is to inherit the FILE_ATTRIBUTE_NO_SCRUB_DATA attribute.<161>

    // -- SMB_COM_NT_CREATE_ANDX ShareAccess
    Constants.FILE_SHARE_NONE = 0x00000000; // (No bits set.)Prevents the file from being shared.
    Constants.FILE_SHARE_READ = 0x00000001; // Other open operations can be performed on the file for read access.
    Constants.FILE_SHARE_WRITE = 0x00000002; // Other open operations can be performed on the file for write access.
    Constants.FILE_SHARE_DELETE = 0x00000004; // Other open operations can be performed on the file for delete access.

    // -- SMB_COM_NT_CREATE_ANDX CreateDisposition
    Constants.FILE_SUPERSEDE = 0x00000000; // (No bits set.)If the file already exists, it SHOULD be superseded (overwritten). If it does not already exist, then it SHOULD be created.
    Constants.FILE_OPEN = 0x00000001; // If the file already exists, it SHOULD be opened rather than created. If the file does not already exist, the operation MUST fail.
    Constants.FILE_CREATE = 0x00000002; // If the file already exists, the operation MUST fail. If the file does not already exist, it SHOULD be created.
    Constants.FILE_OPEN_IF = 0x00000003; // If the file already exists, it SHOULD be opened. If the file does not already exist, then it SHOULD be created. This value is equivalent to (FILE_OPEN | FILE_CREATE).
    Constants.FILE_OVERWRITE = 0x00000004; // If the file already exists, it SHOULD be opened and truncated. If the file does not already exist, the operation MUST fail. The client MUST open the file with at least GENERIC_WRITE access for the command to succeed.
    Constants.FILE_OVERWRITE_IF = 0x00000005; // If the file already exists, it SHOULD be opened and truncated. If the file does not already exist, it SHOULD be created. The client MUST open the file with at least GENERIC_WRITE access.

    // -- SMB_COM_NT_CREATE_ANDX CreateOptions
    Constants.FILE_DIRECTORY_FILE = 0x00000001; // The file being created or opened is a directory file. With this option, the CreateDisposition field MUST be set to FILE_CREATE, FILE_OPEN, or FILE_OPEN_IF. When this bit field is set, other compatible CreateOptions include only the following: FILE_WRITE_THROUGH, FILE_OPEN_FOR_BACKUP_INTENT, and FILE_OPEN_BY_FILE_ID.
    Constants.FILE_WRITE_THROUGH = 0x00000002; // Applications that write data to the file MUST actually transfer the data into the file before any write request is considered complete. If FILE_NO_INTERMEDIATE_BUFFERING is set, the server MUST perform as if FILE_WRITE_THROUGH is set in the create request.
    Constants.FILE_SEQUENTIAL_ONLY = 0x00000004; // This option indicates that access to the file can be sequential. The server can use this information to influence its caching and read-ahead strategy for this file. The file MAY in fact be accessed randomly, but the server can optimize its caching and read-ahead policy for sequential access.
    Constants.FILE_NO_INTERMEDIATE_BUFFERING = 0x00000008; // The file SHOULD NOT be cached or buffered in an internal buffer by the server. This option is incompatible when the FILE_APPEND_DATA bit field is set in the DesiredAccess field.
    Constants.FILE_SYNCHRONOUS_IO_ALERT = 0x00000010; // This flag MUST be ignored by the server, and clients SHOULD set this to 0.
    Constants.FILE_SYNCHRONOUS_IO_NONALERT = 0x00000020; // This flag MUST be ignored by the server, and clients SHOULD set this to 0.
    Constants.FILE_NON_DIRECTORY_FILE = 0x00000040; // If the file being opened is a directory, the server MUST fail the request with STATUS_FILE_IS_A_DIRECTORY in the Status field of the SMB Header in the server response.
    Constants.FILE_CREATE_TREE_CONNECTION = 0x00000080; // This option SHOULD NOT be sent by the clients, and this option MUST be ignored by the server.
    Constants.FILE_COMPLETE_IF_OPLOCKED = 0x00000100; // This option SHOULD NOT be sent by the clients, and this option MUST be ignored by the server.
    Constants.FILE_NO_EA_KNOWLEDGE = 0x00000200; // The application that initiated the client's request does not support extended attributes (EAs). If the EAs on an existing file being opened indicate that the caller SHOULD support EAs to correctly interpret the file, the server SHOULD fail this request with STATUS_ACCESS_DENIED (ERRDOS/ERRnoaccess) in the Status field of the SMB Header in the server response.
    Constants.FILE_OPEN_FOR_RECOVERY = 0x00000400; // This option SHOULD NOT be sent by the clients, and this option MUST be ignored if received by the server.
    Constants.FILE_RANDOM_ACCESS = 0x00000800; // Indicates that access to the file can be random. The server MAY use this information to influence its caching and read-ahead strategy for this file. This is a hint to the server that sequential read-ahead operations might not be appropriate on the file.
    Constants.FILE_DELETE_ON_CLOSE = 0x00001000; // The file SHOULD be automatically deleted when the last open request on this file is closed. When this option is set, the DesiredAccess field MUST include the DELETE flag. This option is often used for temporary files.
    Constants.FILE_OPEN_BY_FILE_ID = 0x00002000; // Opens a file based on the FileId. If this option is set, the server MUST fail the request with STATUS_NOT_SUPPORTED in the Status field of the SMB Header in the server response.
    Constants.FILE_OPEN_FOR_BACKUP_INTENT = 0x00004000; // The file is being opened or created for the purposes of either a backup or a restore operation. Thus, the server can make appropriate checks to ensure that the caller is capable of overriding whatever security checks have been placed on the file to allow a backup or restore operation to occur. The server can check for certain access rights to the file before checking the DesiredAccess field.
    Constants.FILE_NO_COMPRESSION = 0x00008000; // When a new file is created, the file MUST NOT be compressed, even if it is on a compressed volume. The flag MUST be ignored when opening an existing file.
    Constants.FILE_RESERVE_OPFILTER = 0x00100000; // This option SHOULD NOT be sent by the clients, and this option MUST be ignored if received by the server.
    Constants.FILE_OPEN_NO_RECALL = 0x00400000; // In a hierarchical storage management environment, this option requests that the file SHOULD NOT be recalled from tertiary storage such as tape. A file recall can take up to several minutes in a hierarchical storage management environment. The clients can specify this option to avoid such delays.
    Constants.FILE_OPEN_FOR_FREE_SPACE_QUERY = 0x00800000; // This option SHOULD NOT be sent by the clients, and this option MUST be ignored if received by the server.

    // -- SMB2 CreateOptions
    Constants.SMB2_FILE_DIRECTORY_FILE = 0x00000001; // The file being created or opened is a directory file. With this flag, the CreateDisposition field MUST be set to FILE_CREATE, FILE_OPEN_IF, or FILE_OPEN. With this flag, only the following CreateOptions values are valid: FILE_WRITE_THROUGH, FILE_OPEN_FOR_BACKUP_INTENT, FILE_DELETE_ON_CLOSE, and FILE_OPEN_REPARSE_POINT. If the file being created or opened already exists and is not a directory file and FILE_CREATE is specified in the CreateDisposition field, then the server MUST fail the request with STATUS_OBJECT_NAME_COLLISION. If the file being created or opened already exists and is not a directory file and FILE_CREATE is not specified in the CreateDisposition field, then the server MUST fail the request with STATUS_NOT_A_DIRECTORY. The server MUST fail an invalid CreateDisposition field or an invalid combination of CreateOptions flags with STATUS_INVALID_PARAMETER.
    Constants.SMB2_FILE_WRITE_THROUGH = 0x00000002; // The server MUST propagate writes to this open to persistent storage before returning success to the client on write operations.
    Constants.SMB2_FILE_SEQUENTIAL_ONLY = 0x00000004; // This indicates that the application intends to read or write at sequential offsets using this handle, so the server SHOULD optimize for sequential access. However, the server MUST accept any access pattern. This flag value is incompatible with the FILE_RANDOM_ACCESS value.
    Constants.SMB2_FILE_NO_INTERMEDIATE_BUFFERING = 0x00000008; // The server or underlying object store SHOULD NOT cache data at intermediate layers and SHOULD allow it to flow through to persistent storage.
    Constants.SMB2_FILE_SYNCHRONOUS_IO_ALERT = 0x00000010; // This bit SHOULD be set to 0 and MUST be ignored by the server.<36>
    Constants.SMB2_FILE_SYNCHRONOUS_IO_NONALERT = 0x00000020; // This bit SHOULD be set to 0 and MUST be ignored by the server.<37>
    Constants.SMB2_FILE_NON_DIRECTORY_FILE = 0x00000040; // If the name of the file being created or opened matches with an existing directory file, the server MUST fail the request with STATUS_FILE_IS_A_DIRECTORY. This flag MUST NOT be used with FILE_DIRECTORY_FILE or the server MUST fail the request with STATUS_INVALID_PARAMETER.
    Constants.SMB2_FILE_COMPLETE_IF_OPLOCKED = 0x00000100; // This bit SHOULD be set to 0 and MUST be ignored by the server.<38>
    Constants.SMB2_FILE_NO_EA_KNOWLEDGE = 0x00000200; // The caller does not understand how to handle extended attributes. If the request includes an SMB2_CREATE_EA_BUFFER create context, then the server MUST fail this request with STATUS_ACCESS_DENIED. If extended attributes with the FILE_NEED_EA flag (see [MS-FSCC] section 2.4.15) set are associated with the file being opened, then the server MUST fail this request with STATUS_ACCESS_DENIED.
    Constants.SMB2_FILE_RANDOM_ACCESS = 0x00000800; // This indicates that the application intends to read or write at random offsets using this handle, so the server SHOULD optimize for random access. However, the server MUST accept any access pattern. This flag value is incompatible with the FILE_SEQUENTIAL_ONLY value. If both FILE_RANDOM_ACCESS and FILE_SEQUENTIAL_ONLY are set, then FILE_SEQUENTIAL_ONLY is ignored.
    Constants.SMB2_FILE_DELETE_ON_CLOSE = 0x00001000; // The file MUST be automatically deleted when the last open request on this file is closed. When this option is set, the DesiredAccess field MUST include the DELETE flag. This option is often used for temporary files.
    Constants.SMB2_FILE_OPEN_BY_FILE_ID = 0x00002000; // This bit SHOULD be set to 0 and the server MUST fail the request with a STATUS_NOT_SUPPORTED error if this bit is set.<39>
    Constants.SMB2_FILE_OPEN_FOR_BACKUP_INTENT = 0x00004000; // The file is being opened for backup intent. That is, it is being opened or created for the purposes of either a backup or a restore operation. The server can check to ensure that the caller is capable of overriding whatever security checks have been placed on the file to allow a backup or restore operation to occur. The server can check for access rights to the file before checking the DesiredAccess field.
    Constants.SMB2_FILE_NO_COMPRESSION = 0x00008000; // The file cannot be compressed. This bit is ignored when FILE_DIRECTORY_FILE is set in CreateOptions.
    Constants.SMB2_FILE_OPEN_REMOTE_INSTANCE = 0x00000400; // This bit SHOULD be set to 0 and MUST be ignored by the server.
    Constants.SMB2_FILE_OPEN_REQUIRING_OPLOCK = 0x00010000; // This bit SHOULD be set to 0 and MUST be ignored by the server.
    Constants.SMB2_FILE_DISALLOW_EXCLUSIVE = 0x00020000; // This bit SHOULD be set to 0 and MUST be ignored by the server.
    Constants.SMB2_FILE_RESERVE_OPFILTER = 0x00100000; // This bit SHOULD be set to 0 and the server MUST fail the request with a STATUS_NOT_SUPPORTED error if this bit is set.<40>
    Constants.SMB2_FILE_OPEN_REPARSE_POINT = 0x00200000; // If the file or directory being opened is a reparse point, open the reparse point itself rather than the target that the reparse point references.
    Constants.SMB2_FILE_OPEN_NO_RECALL = 0x00400000; // In an HSM (Hierarchical Storage Management) environment, this flag means the file SHOULD NOT be recalled from tertiary storage such as tape. The recall can take several minutes. The caller can specify this flag to avoid those delays.
    Constants.SMB2_FILE_OPEN_FOR_FREE_SPACE_QUERY = 0x00800000; // Open file to query for free space. The client SHOULD set this to 0 and the server MUST ignore it.<41>

    // -- SMB_COM_NT_CREATE_ANDX ImpersonationLevel
    Constants.SEC_ANONYMOUS = 0x00000000; // The application-requested impersonation level is Anonymous.
    Constants.SEC_IDENTIFY = 0x00000001; // The application-requested impersonation level is Identification.
    Constants.SEC_IMPERSONATE = 0x00000002; // The application-requested impersonation level is Impersonation.

    // -- SMB_COM_NT_CREATE_ANDX SecurityFlags
    Constants.SMB_SECURITY_CONTEXT_TRACKING = 0x01; // When set, dynamic tracking is requested. When this bit field is not set, static tracking is requested.
    Constants.SMB_SECURITY_EFFECTIVE_ONLY = 0x02; // Specifies that only the enabled aspects of the client's security context are available to the server. If this flag is not specified, all aspects of the client's security context are available. This flag allows the client to limit the groups and privileges that a server can use while impersonating the client.

    // -- SMB_COM_NT_CREATE_ANDX extFileAttributes
    Constants.ATTR_READONLY = 0x00000001; // The file is read only. Applications can read the file but cannot write to it or delete it.
    Constants.ATTR_HIDDEN = 0x00000002; // The file is hidden. It is not to be included in an ordinary directory listing.
    Constants.ATTR_SYSTEM = 0x00000004; // The file is part of or is used exclusively by the operating system.
    Constants.ATTR_DIRECTORY = 0x00000010; // The file is a directory.
    Constants.ATTR_ARCHIVE = 0x00000020; // The file has not been archived since it was last modified. Applications use this attribute to mark files for backup or removal.
    Constants.ATTR_NORMAL = 0x00000080; // The file has no other attributes set. This attribute is valid only if used alone.
    Constants.ATTR_TEMPORARY = 0x00000100; // The file is temporary. This is a hint to the cache manager that it does not need to flush the file to backing storage.
    Constants.ATTR_COMPRESSED = 0x00000800; // The file or directory is compressed. For a file, this means that all of the data in the file is compressed. For a directory, this means that compression is the default for newly created files and subdirectories.
    Constants.POSIX_SEMANTICS = 0x01000000; // Indicates that the file is to be accessed according to POSIX rules. This includes allowing multiple files with names differing only in case, for file systems that support such naming.<15>
    Constants.BACKUP_SEMANTICS = 0x02000000; // Indicates that the file is being opened or created for a backup or restore operation. The server SHOULD allow the client to override normal file security checks, provided it has the necessary permission to do so.
    Constants.DELETE_ON_CLOSE = 0x04000000; // Requests that the server delete the file immediately after all of its handles have been closed.
    Constants.SEQUENTIAL_SCAN = 0x08000000; // Indicates that the file is to be accessed sequentially from beginning to end.<16>
    Constants.RANDOM_ACCESS = 0x10000000; // Indicates that the application is designed to access the file randomly. The server can use this flag to optimize file caching.
    Constants.NO_BUFFERING = 0x20000000; // Requests that the server open the file with no intermediate buffering or caching; the server might not honor the request. The application MUST meet certain requirements when working with files opened with FILE_FLAG_NO_BUFFERING. File access MUST begin at offsets within the file that are integer multiples of the volume's sector size and MUST be for numbers of bytes that are integer multiples of the volume's sector size. For example, if the sector size is 512 bytes, an application can request reads and writes of 512, 1024, or 2048 bytes, but not of 335, 981, or 7171 bytes.
    Constants.WRITE_THROUGH = 0x80000000; // Instructs the operating system to write through any intermediate cache and go directly to the file. The operating system can still cache write operations, but cannot lazily flush them.

    // -- DCE/RPC Packet Types
    Constants.DCERPC_PACKET_TYPE_REQUEST = 0x00; // Request
    Constants.DCERPC_PACKET_TYPE_BIND = 0x0b; // Bind
    Constants.DCERPC_PACKET_TYPE_BIND_ACK = 0x0c; // Bind_ack

    // -- Share Types
    Constants.STYPE_DISKTREE = 0x00000000; // Disk drive
    Constants.STYPE_PRINTQ = 0x00000001; // Print queue
    Constants.STYPE_DEVICE = 0x00000002; // Communication device
    Constants.STYPE_IPC = 0x00000003; // Interprocess communication (IPC)
    Constants.STYPE_CLUSTER_FS = 0x02000000; // A cluster share
    Constants.STYPE_CLUSTER_SOFS = 0x04000000; // A Scale-Out cluster share
    Constants.STYPE_CLUSTER_DFS = 0x08000000; // A DFS share in a cluster
    Constants.STYPE_SPECIAL = 0x80000000; // Special share reserved for interprocess communication (IPC$) or remote administration of the server (ADMIN$). Can also refer to administrative shares such as C$, D$, E$, and so forth.
    Constants.STYPE_TEMPORARY = 0x40000000; // A temporary share that is not persisted for creation each time the file server initializes.

    // -- QUERY Information Level Codes
    Constants.SMB_INFO_STANDARD = 0x0001; // Query creation, access, and last write timestamps, size and file attributes.
    Constants.SMB_INFO_QUERY_EA_SIZE = 0x0002; // Query the SMB_INFO_STANDARD data along with the size of the file's extended attributes (EAs).
    Constants.SMB_INFO_QUERY_EAS_FROM_LIST = 0x0003; // Query a file's specific EAs by attribute name.
    Constants.SMB_INFO_QUERY_ALL_EAS = 0x0004; // Query all of a file's EAs.
    Constants.SMB_INFO_IS_NAME_VALID = 0x0006; // Validate the syntax of the path provided in the request. Not supported for TRANS2_QUERY_FILE_INFORMATION.
    Constants.SMB_QUERY_FILE_BASIC_INFO = 0x0101; // Query 64-bit create, access, write, and change timestamps along with extended file attributes.
    Constants.SMB_QUERY_FILE_STANDARD_INFO = 0x0102; // Query size, number of links, if a delete is pending, and if the path is a directory.
    Constants.SMB_QUERY_FILE_EA_INFO = 0x0103; // Query the size of the file's EAs.
    Constants.SMB_QUERY_FILE_NAME_INFO = 0x0104; // Query the long file name in Unicode format.
    Constants.SMB_QUERY_FILE_ALL_INFO = 0x0107; // Query the SMB_QUERY_FILE_BASIC_INFO, SMB_FILE_QUERY_STANDARD_INFO, SMB_FILE_EA_INFO, and SMB_QUERY_FILE_NAME_INFO data as well as access flags, access mode, and alignment information in a single request.
    Constants.SMB_QUERY_FILE_ALT_NAME_INFO = 0x0108; // Query the 8.3 file name.<22>
    Constants.SMB_QUERY_FILE_STREAM_INFO = 0x0109; // Query file stream information.
    Constants.SMB_QUERY_FILE_COMPRESSION_INFO = 0x010B; // Query file compression information.

    // -- SMB_FILE_ATTRIBUTE
    Constants.SMB_FILE_ATTRIBUTE_NORMAL = 0x0000; // Normal file.
    Constants.SMB_FILE_ATTRIBUTE_READONLY = 0x0001; // Read-only file.
    Constants.SMB_FILE_ATTRIBUTE_HIDDEN = 0x0002; // Hidden file.
    Constants.SMB_FILE_ATTRIBUTE_SYSTEM = 0x0004; // System file.
    Constants.SMB_FILE_ATTRIBUTE_VOLUME = 0x0008; // Volume Label.
    Constants.SMB_FILE_ATTRIBUTE_DIRECTORY = 0x0010; // Directory file.
    Constants.SMB_FILE_ATTRIBUTE_ARCHIVE = 0x0020; // File changed since last archive.
    Constants.SMB_SEARCH_ATTRIBUTE_READONLY = 0x0100; // Search for Read-only files.
    Constants.SMB_SEARCH_ATTRIBUTE_HIDDEN = 0x0200; // Search for Hidden files.
    Constants.SMB_SEARCH_ATTRIBUTE_SYSTEM = 0x0400; // Search for System files.
    Constants.SMB_SEARCH_ATTRIBUTE_DIRECTORY = 0x1000; // Search for Directory files.
    Constants.SMB_SEARCH_ATTRIBUTE_ARCHIVE = 0x2000; // Search for files that have changed since they were last archived.
    Constants.Other = 0xC8C0; // Reserved.

    // -- FIND Information Level Codes
    Constants.SMB_INFO_STANDARD = 0x0001; // Return creation, access, and last write timestamps, size and file attributes along with the file name.
    Constants.SMB_INFO_QUERY_EA_SIZE = 0x0002; // Return the SMB_INFO_STANDARD data along with the size of a file's extended attributes (EAs).
    Constants.SMB_INFO_QUERY_EAS_FROM_LIST = 0x0003; // Return the SMB_INFO_QUERY_EA_SIZE data along with a specific list of a file's EAs. The requested EAs are provided in the Trans2_Data block of the request.
    Constants.SMB_FIND_FILE_DIRECTORY_INFO = 0x0101; // Return 64-bit format versions of: creation, access, last write, and last attribute change timestamps; size. In addition, return extended file attributes and file name.
    Constants.SMB_FIND_FILE_FULL_DIRECTORY_INFO = 0x0102; // Returns the SMB_FIND_FILE_DIRECTORY_INFO data along with the size of a file's EAs.
    Constants.SMB_FIND_FILE_NAMES_INFO = 0x0103; // Returns the name(s) of the file(s).
    Constants.SMB_FIND_FILE_BOTH_DIRECTORY_INFO = 0x0104; // Returns a combination of the data from SMB_FIND_FILE_FULL_DIRECTORY_INFO and SMB_FIND_FILE_NAMES_INFO.

    // -- SMB2 RequestedOplockLevel
    Constants.SMB2_OPLOCK_LEVEL_NONE = 0x00; // No oplock is requested.
    Constants.SMB2_OPLOCK_LEVEL_II = 0x01; // A level II oplock is requested.
    Constants.SMB2_OPLOCK_LEVEL_EXCLUSIVE = 0x08; // An exclusive oplock is requested.
    Constants.SMB2_OPLOCK_LEVEL_BATCH = 0x09; // A batch oplock is requested.
    Constants.SMB2_OPLOCK_LEVEL_LEASE = 0xFF; // A lease is requested. If set, the request packet MUST contain an SMB2_CREATE_REQUEST_LEASE (section 2.2.13.2.8) create context. This value is not valid for the SMB 2.0.2 dialect.

    // -- SMB2 CreateContext
    Constants.SMB2_CREATE_EA_BUFFER = new Uint8Array([0x45, 0x78, 0x74, 0x41]); // ("ExtA")
    Constants.SMB2_CREATE_SD_BUFFER = new Uint8Array([0x53, 0x65, 0x63, 0x44]); // ("SecD")
    Constants.SMB2_CREATE_DURABLE_HANDLE_REQUEST = new Uint8Array([0x44, 0x48, 0x6e, 0x51]); // ("DHnQ")
    Constants.SMB2_CREATE_DURABLE_HANDLE_RECONNECT = new Uint8Array([0x44, 0x48, 0x6e, 0x43]); // ("DHnC")
    Constants.SMB2_CREATE_ALLOCATION_SIZE = new Uint8Array([0x41, 0x6c, 0x53, 0x69]); // ("AISi")
    Constants.SMB2_CREATE_QUERY_MAXIMAL_ACCESS_REQUEST = new Uint8Array([0x4d, 0x78, 0x41, 0x63]); // ("MxAc")
    Constants.SMB2_CREATE_TIMEWARP_TOKEN = new Uint8Array([0x54, 0x57, 0x72, 0x70]); // ("TWrp")
    Constants.SMB2_CREATE_QUERY_ON_DISK_ID = new Uint8Array([0x51, 0x46, 0x69, 0x64]); // ("QFid")
    Constants.SMB2_CREATE_REQUEST_LEASE = new Uint8Array([0x52, 0x71, 0x4c, 0x73]); // ("RqLs")
    Constants.SMB2_CREATE_REQUEST_LEASE_V2 = new Uint8Array([0x52, 0x71, 0x4c, 0x73]); // ("RqLs")
    Constants.SMB2_CREATE_DURABLE_HANDLE_REQUEST_V2 = new Uint8Array([0x44, 0x48, 0x32, 0x51]); // ("DH2Q")
    Constants.SMB2_CREATE_DURABLE_HANDLE_RECONNECT_V2 = new Uint8Array([0x44, 0x48, 0x32, 0x43]); // ("DH2C")
    Constants.SMB2_CREATE_APP_INSTANCE_ID = new Uint8Array([0x45, 0xBC, 0xA6, 0x6A, 0xEF, 0xA7, 0xF7, 0x4A,
                                                            0x90, 0x08, 0xFA, 0x46, 0x2E, 0x14, 0x4D, 0x74]);
    Constants.SMB2_CREATE_APP_INSTANCE_VERSION = new Uint8Array([0xB9, 0x82, 0xD0 ,0xB7, 0x3B, 0x56, 0x07, 0x4F,
                                                                 0xA0, 0x7B, 0x52, 0x4A, 0x81, 0x16, 0xA0, 0x10]);
    Constants.SVHDX_OPEN_DEVICE_CONTEXT = new Uint8Array([0x9C, 0xCB, 0xCF, 0x9E, 0x04, 0xC1, 0xE6, 0x43,
                                                          0x98, 0x0E, 0x15, 0x8D, 0xA1, 0xF6, 0xEC, 0x83]);

    // -- SMB2 IOCTL CtlCode
    Constants.FSCTL_DFS_GET_REFERRALS = 0x00060194;
    Constants.FSCTL_PIPE_PEEK = 0x0011400C;
    Constants.FSCTL_PIPE_WAIT = 0x00110018;
    Constants.FSCTL_PIPE_TRANSCEIVE = 0x0011C017;
    Constants.FSCTL_SRV_COPYCHUNK = 0x001440F2;
    Constants.FSCTL_SRV_ENUMERATE_SNAPSHOTS = 0x00144064;
    Constants.FSCTL_SRV_REQUEST_RESUME_KEY = 0x00140078;
    Constants.FSCTL_SRV_READ_HASH = 0x001441bb;
    Constants.FSCTL_SRV_COPYCHUNK_WRITE = 0x001480F2;
    Constants.FSCTL_LMR_REQUEST_RESILIENCY = 0x001401D4;
    Constants.FSCTL_QUERY_NETWORK_INTERFACE_INFO = 0x001401FC;
    Constants.FSCTL_SET_REPARSE_POINT = 0x000900A4;
    Constants.FSCTL_DFS_GET_REFERRALS_EX = 0x000601B0;
    Constants.FSCTL_FILE_LEVEL_TRIM = 0x00098208;
    Constants.FSCTL_VALIDATE_NEGOTIATE_INFO = 0x00140204;
    
    // -- SMB2 IOCTL Flags
    Constants.SMB2_0_IOCTL_IS_FSCTL = 0x00000001; // If Flags is set to this value, the request is an FSCTL request.

    // -- SMB2 Info Type
    Constants.SMB2_0_INFO_FILE = 0x01; // The file information is requested.
    Constants.SMB2_0_INFO_FILESYSTEM = 0x02; // The underlying object store information is requested.
    Constants.SMB2_0_INFO_SECURITY = 0x03; // The security information is requested.
    Constants.SMB2_0_INFO_QUOTA = 0x04; // The underlying object store quota information is requested.
    
    // -- SMB2 File Info Class
    Constants.SMB2_0_FILE_ALL_INFORMATION = 0x12;
    Constants.SMB2_0_FILE_ID_BOTH_DIRECTORY_INFORMATION = 0x25;
    Constants.SMB2_0_FILE_DISPOSITION_INFORMATION = 0x0d;
    
    // -- SMB2 QueryDirectoryInfo Flags
    Constants.SMB2_RESTART_SCANS = 0x01; // The server MUST restart the enumeration from the beginning, but the search pattern is not changed.
    Constants.SMB2_RETURN_SINGLE_ENTRY = 0x02; // The server MUST only return the first entry of the search results.
    Constants.SMB2_INDEX_SPECIFIED = 0x04; // The server SHOULD<66> return entries beginning at the byte number specified by FileIndex.
    Constants.SMB2_REOPEN = 0x10; // The server MUST restart the enumeration from the beginning, and the search pattern MUST be changed to the provided value. This often involves silently closing and reopening the directory on the server side.

    SmbClient.Constants = Constants;

})();
