git clone --depth 1 --branch master --recursive git://github.com/c24w/JavaScript-Testing-Framework.git JTF;
cd ./JTF;
ls -a | grep -v 'src' | xargs rm -rf;
find -type f -name '.*' -o -name '*.md' | xargs rm -f
cd ..