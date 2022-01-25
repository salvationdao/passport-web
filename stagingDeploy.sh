#!/bin/bash
# build binary
npm run build
# upload binary
scp -r ./build "root@sale.supremacy.fi:/root/passport-web/www"
# move binary and restart services
ssh root@sale.supremacy.fi 'mv /root/passport-web/www /home/passport-web/www && sudo systemctl restart nginx'
