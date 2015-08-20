(function(Smb2, Constants, Debug, Protocol, Packet) {
    "use strict";
    
    // Constructor
    
    var ClientImpl = function(client) {
        this.protocol_ = new Protocol();
      
        this.client_ = client;
        this.comm_ = client.getCommunication();
    };
    
    // Public functions
    
    // Export
    
    Smb2.ClientImpl = ClientImpl;
    
    
})(SmbClient.Smb2,
   SmbClient.Constants,
   SmbClient.Debug,
   SmbClient.Smb2.Protocol,
   SmbClient.Packet);
