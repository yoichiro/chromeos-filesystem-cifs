(function(Auth,
          Debug,
          Constants,
          Type3Message,
          LmHash,
          LmResponse,
          NtlmHash,
          NtlmV2Hash,
          NtlmV2Response,
          LmV2Response,
          Ntlm2SessionResponse,
          Type1Message) {
    "use strict";

    // Constructor
    var TypeMessageUtils = function() {
    };

    // Public functions

    /*jslint bitwise: true */
    TypeMessageUtils.prototype.createType1Message = function() {
        var type1Message = new Type1Message();
        type1Message.setFlag(
              Constants.NTLMSSP_NEGOTIATE_UNICODE
            | Constants.NTLMSSP_REQUEST_TARGET
            | Constants.NTLMSSP_NEGOTIATE_SIGN
            | Constants.NTLMSSP_NEGOTIATE_NTLM
            | Constants.NTLMSSP_NEGOTIATE_OEM_DOMAIN_SUPPLIED
            | Constants.NTLMSSP_NEGOTIATE_OEM_WORKSTATION_SUPPLIED
            | Constants.NTLMSSP_NEGOTIATE_ALWAYS_SIGN
            | Constants.NTLMSSP_NEGOTIATE_NTLM2_KEY
//            | Constants.NTLMSSP_NEGOTIATE_KEY_EXCH
            | Constants.NTLMSSP_NEGOTIATE_128
        );
        type1Message.setSuppliedDomain("?");
        type1Message.setSuppliedWorkstation("FSP_CIFS");

        return type1Message;
    };

    /*jslint bitwise: true */
    TypeMessageUtils.prototype.createType3Message = function(
            username, password, domainName, serverChallenge, type2Message, lmCompatibilityLevel) {
        var type3Message = new Type3Message();

        var lmHashObj, lmHash, lmResponseObj, lmResponse;
        var ntlmHashObj, ntlmHash, ntlmResponseObj, ntlmResponse;
        var ntlm2SessionResponse, response;
        /*
         * 0 -> LM & NTLM
         * 1 -> LM & NTLM (NTLMv2 Session Security is applied when it is negotiated)
         * 2 -> NTLM Only
         * 3 -> NTLMv2 Only
         * 4 -> NTLMv2 Only (LM is rejected)
         * 5 -> NTLMv2 Only (LM and NTLM are rejected)
         */
        switch(lmCompatibilityLevel) {
        case 0:
            Debug.info("Use LMv1 and NTLMv1 because LMCompatibilityLevel=0");
            lmHashObj = new LmHash();
            lmHash = lmHashObj.create(password);
            lmResponseObj = new LmResponse();
            lmResponse = lmResponseObj.create(lmHash, serverChallenge);

            ntlmHashObj = new NtlmHash();
            ntlmHash = ntlmHashObj.create(password);
            ntlmResponseObj = new LmResponse();
            ntlmResponse = ntlmResponseObj.create(ntlmHash, serverChallenge);

            type3Message.setLmResponse(lmResponse);
            type3Message.setNtlmResponse(ntlmResponse);

            type3Message.setFlag(
                Constants.NTLMSSP_NEGOTIATE_UNICODE
                    | Constants.NTLMSSP_NEGOTIATE_NTLM
            );
            break;
        case 1:
            if (type2Message.isFlagOf(Constants.NTLMSSP_NEGOTIATE_NTLM2_KEY)) {
                Debug.info("Use NTLM2 Session Response because LMCompatibilityLevel=1 and NTLMSSP_NEGOTIATE_NTLM2_KEY=true");
                ntlm2SessionResponse = new Ntlm2SessionResponse();
                response = ntlm2SessionResponse.create(password, serverChallenge);
                type3Message.setLmResponse(response.lmResponse);
                type3Message.setNtlmResponse(response.ntlmResponse);

                type3Message.setFlag(
                    Constants.NTLMSSP_NEGOTIATE_UNICODE
                        | Constants.NTLMSSP_NEGOTIATE_NTLM
                        | Constants.NTLMSSP_NEGOTIATE_NTLM2_KEY
                );
            } else {
                Debug.info("Use LMv1 and NTLMv1 because LMCompatibilityLevel=1");
                lmHashObj = new LmHash();
                lmHash = lmHashObj.create(password);
                lmResponseObj = new LmResponse();
                lmResponse = lmResponseObj.create(lmHash, serverChallenge);

                ntlmHashObj = new NtlmHash();
                ntlmHash = ntlmHashObj.create(password);
                ntlmResponseObj = new LmResponse();
                ntlmResponse = ntlmResponseObj.create(ntlmHash, serverChallenge);

                type3Message.setLmResponse(lmResponse);
                type3Message.setNtlmResponse(ntlmResponse);

                type3Message.setFlag(
                    Constants.NTLMSSP_NEGOTIATE_UNICODE
                        | Constants.NTLMSSP_NEGOTIATE_NTLM
                );
            }
            break;
        case 2:
            Debug.info("Use both NTLMv1 because LMCompatibilityLevel=2");
            ntlmHashObj = new NtlmHash();
            ntlmHash = ntlmHashObj.create(password);
            ntlmResponseObj = new LmResponse();
            ntlmResponse = ntlmResponseObj.create(ntlmHash, serverChallenge);

            type3Message.setLmResponse(ntlmResponse);
            type3Message.setNtlmResponse(ntlmResponse);

            type3Message.setFlag(
                Constants.NTLMSSP_NEGOTIATE_UNICODE
                    | Constants.NTLMSSP_NEGOTIATE_NTLM
            );
            break;
        case 3:
        case 4:
        case 5:
            Debug.info("Use LMv2 and NTLMv2 because LMCompatibilityLevel=" + lmCompatibilityLevel);
            var lmV2HashObj = new NtlmV2Hash();
            var lmV2Hash = lmV2HashObj.create(username, password, domainName);
            var lmV2ResponseObj = new LmV2Response();
            var lmV2Response = lmV2ResponseObj.create(lmV2Hash, serverChallenge);

            var ntlmV2HashObj = new NtlmV2Hash();
            var ntlmV2Hash = ntlmV2HashObj.create(username, password, domainName);
            var ntlmV2ResponseObj = new NtlmV2Response();
            var targetInformation = type2Message.getTargetInformation();
            var ntlmV2Response = ntlmV2ResponseObj.create(ntlmV2Hash, serverChallenge, targetInformation);

            type3Message.setLmResponse(lmV2Response);
            type3Message.setNtlmResponse(ntlmV2Response);

            type3Message.setFlag(
                Constants.NTLMSSP_NEGOTIATE_UNICODE
                    | Constants.NTLMSSP_NEGOTIATE_NTLM
            );
        }

        type3Message.setDomainName(domainName);
        type3Message.setUsername(username);
        type3Message.setWorkstationName("FSP_CIFS");
        type3Message.setSessionKey(null);
        type3Message.load(type2Message);

        return type3Message;
    };

    // Export
    Auth.TypeMessageUtils = TypeMessageUtils;

})(SmbClient.Auth,
   SmbClient.Debug,
   SmbClient.Constants,
   SmbClient.Auth.Type3Message,
   SmbClient.Auth.LmHash,
   SmbClient.Auth.LmResponse,
   SmbClient.Auth.NtlmHash,
   SmbClient.Auth.NtlmV2Hash,
   SmbClient.Auth.NtlmV2Response,
   SmbClient.Auth.LmV2Response,
   SmbClient.Auth.Ntlm2SessionResponse,
   SmbClient.Auth.Type1Message);
