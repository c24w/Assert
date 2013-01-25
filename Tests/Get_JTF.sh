git clone --depth 1 --branch master git://github.com/c24w/JavaScript-Testing-Framework.git JTF;
cd ./JTF;
git submodule init;
git submodule update;
ls -a | grep -v 'src' | xargs rm -rf;
find -type f -name '.*' -o -name '*.md' | xargs rm -f