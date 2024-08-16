### GenScale -- v0

1. Setup GenScale by following instructions in SETUP.md. 
2. NodeJS backend of GenScale runs on port 3333 of the host node. Suppose node name is 'genscale-node'. We can do port-forwarding to a local machine:

`ssh -f -N -L localhost:3333:localhost:3333 genscale-node`

Open a browser on the local machine and type 'localhost:3333'. 