# Firebase Token Verifier

This is a current WIP project that takes in a JSON Web Token (JWT) supplied by a client and decrypts/verifies it with your org secret from AWS Secret Manager (SM). This verifies the client is who they say they are and provides basic information about them as provided by firebase and your configuration there. It is barebones but useful enough to be able to build/import into other Lambdas and utilites that need it.
