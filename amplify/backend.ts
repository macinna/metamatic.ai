import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';

const backend = defineBackend({
  auth,
  data,
});

const { cfnResources } = backend.auth.resources;
const { cfnUserPool, cfnUserPoolClient } = cfnResources;

// Specify which authentication factors you want to allow with USER_AUTH
// Enforce passwordless: allow only EMAIL_OTP
cfnUserPool.addPropertyOverride(
  'Policies.SignInPolicy.AllowedFirstAuthFactors',
  ['EMAIL_OTP', 'PASSWORD']
);

cfnUserPool.emailConfiguration = {
  emailSendingAccount: 'DEVELOPER',
  sourceArn: 'arn:aws:ses:us-east-1:366815213561:identity/info@metamatic.ai'
};  



// The USER_AUTH flow is used for passwordless sign in
cfnUserPoolClient.explicitAuthFlows = [
	'ALLOW_USER_AUTH'
];


/* Needed for WebAuthn */
// The WebAuthnRelyingPartyID is the domain of your relying party, e.g. "example.domain.com"
// cfnUserPool.addPropertyOverride('WebAuthnRelyingPartyID', '<RELYING_PARTY>');
//cfnUserPool.addPropertyOverride('WebAuthnUserVerification', 'preferred');