
# just another to do app

```shell
# Dev
npm start


# Package
npm run package
```


```shell
# Create a set of icons from png
mkdir ./assets/set.iconset
cp ./assets/favicon.png ./assets/set.iconset/icon_512x512@2x.png
iconutil -c icns ./assets/set.iconset
rm -rf ./assets/set.iconset

```