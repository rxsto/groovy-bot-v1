tar -cf backup.tar *
move backup.tar ../
cd ../
rm -rf Groovy/
mkdir Groovy
move update.tar Groovy/
cd Groovy/
untar update.tar
npm install
start.sh