# Twilio to Viptel Outbound Routing

Twilio REST API is used to trigger outbound calls. In order to route these through the Viptel SIP trunk without setting up complex IP whitelisting or Twilio Elastic SIP Trunks, we pass the Viptel credentials directly in the Twilio `Calls.json` payload.

```javascript
const toParam = `sip:00421915165972@sip.viptel.sk`;
const fromParam = `sip:00421352289942@sip.viptel.sk`;

body.append("SipAuthUsername", "00421352289942");
body.append("SipAuthPassword", "VIPTEL_PASSWORD_HERE");
body.append("To", toParam);
body.append("From", fromParam);
```

This method allows Base44 functions to dynamically route any outbound call through Viptel while passing SIP auth directly via Twilio.
