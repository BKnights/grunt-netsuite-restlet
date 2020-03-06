# Restlet for Uploading files to Netsuite File Cabinet

This is a companion RESTlet for the grunt-netsuite npm module. It is available as Bundle 322271 File Upload. The bundle includes the RESTlet setup and a role suitable for uploading SSP and Web Site files.

## Setup

First install the npm module grunt-netsuite and copy or rename the ns_config-sample.json to ns_config.json.

```shell
npm install grunt-netsuite --save-dev
```

In order to use the RESTlet you'll need to create access. See the Netsuite help for creating an integration and access tokens.

When the integration is created Netsuite will present integration id and secret tokens. These should be copied and pasted to the ns_config.json file.


When the access tokens are created they too should be copied and pasted to the ns_config.json file.

When you have deployed the RESTlet (either via the bundle installation or by downloading and installing this code) copy its external URL to ns_config.json as well.

## Permissions
The role for access needs to be able to run search; upload html and js files; list websites; access the file cabinet and login with access tokens. The Bundle sets this role up as 'Deployer Access'. The file customrole_file_deployer.xml is from the Export as XML function in the bundle's home account.

## Hacking
If you want to use the RESTlet outside of the companion Grunt task you need to send the expected payload. The RESTlet expects each file to be posted as JSON .

```js
{
  rootId: //the numeric id of the base folder for the uploaded files to be deployed. If null or missing then the folderPath starts at the top level of the file cabinet with no preceding /.
  folderPath: //path under the root at which to upload this file. No initial /. Trailing slash is ignored.
  fileName: // filename and extension of file
  encoding: //generally utf8 or null. May be one of the character encodings recognized by Netsuite.
  mimeType: // file's mime-type. .SS and .SSP files don't have a well known mimeType that maps to Netsuite so their file cabinet type is set by the RESTlet.
  isPublic: // whether file should be available for direct download. Generally true.
}
```
