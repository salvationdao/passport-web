#!/bin/bash
# build binary
npm run build
# upload binary
scp -r ./build "root@sale.supremacy.fi:/root/passport-web/www"
# move binary and restart services
ssh root@sale.supremacy.fi 'rm -rf /home/passport-web/www && mv /root/passport-web/www /home/passport-web && sudo systemctl restart nginx'
