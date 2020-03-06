/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 */
define(["require", "exports", "N/file", "N/log", "N/record", "N/search"], function (require, exports, file, log, record, search) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function getFileType(mimeType, ext) {
        switch (ext) {
            case 'ssp': return file.Type.WEBAPPPAGE;
            case 'ss': return file.Type.WEBAPPSCRIPT;
        }
        switch (mimeType) {
            case 'application/javascript': return file.Type.JAVASCRIPT;
            case 'application/json': return file.Type.JSON;
            case 'application/msword': return file.Type.WORD;
            case 'application/pdf': return file.Type.PDF;
            case 'application/postscript': return file.Type.POSTSCRIPT;
            case 'application/rtf': return file.Type.RTF;
            case 'application/sms': return file.Type.SMS;
            case 'application/vnd.ms-excel': return file.Type.EXCEL;
            case 'application/vnd.ms-powerpoint': return file.Type.POWERPOINT;
            case 'application/vnd.ms-project': return file.Type.MSPROJECT;
            case 'application/vnd.visio': return file.Type.VISIO;
            case 'application/x-autocad': return file.Type.AUTOCAD;
            case 'application/x-gzip-compressed': return file.Type.GZIP;
            case 'application/x-shockwave-flash': return file.Type.FLASH;
            case 'application/zip': return file.Type.ZIP;
            case 'audio/mpeg': return file.Type.MP3;
            case 'image/gif': return file.Type.GIFIMAGE;
            case 'image/ico': return file.Type.ICON;
            case 'image/jpeg': return file.Type.JPGIMAGE;
            case 'image/pjpeg': return file.Type.PJPGIMAGE;
            case 'image/png': return file.Type.PNGIMAGE;
            case 'image/svg+xml': return file.Type.SVG;
            case 'image/tiff': return file.Type.TIFFIMAGE;
            case 'image/x-xbitmap': return file.Type.BMPIMAGE;
            case 'message/rfc822': return file.Type.MESSAGERFC;
            case 'text/css': return file.Type.STYLESHEET;
            case 'text/csv': return file.Type.CSV;
            case 'text/html': return file.Type.HTMLDOC;
            case 'text/javascript': return file.Type.JAVASCRIPT;
            case 'text/plain': return file.Type.PLAINTEXT;
            case 'text/xml': return file.Type.XMLDOC;
            case 'video/mpeg': return file.Type.MPEGMOVIE;
            case 'video/quicktime': return file.Type.QUICKTIME;
        }
        return file.Type.ZIP;
    }
    function getNSEncoding(stdEncoding) {
        switch (stdEncoding) {
            case 'utf-8':
            case 'utf8':
                return file.Encoding.UTF_8;
            case 'iso-8859-1':
                return file.Encoding.ISO_8859_1;
            case 'windows-1252':
                return file.Encoding.WINDOWS_1252;
            default: return null;
        }
    }
    function getExt(fileName) {
        return fileName.slice(fileName.lastIndexOf('.') + 1).toLowerCase();
    }
    function post(data) {
        try {
            log.debug({
                title: 'have types: ',
                details: JSON.stringify(file.Type)
            });
            // log.debug({
            //   title:'have endcodings: ',
            //   details:JSON.stringify(file.Encoding)
            // });
            var rootFolderId = data.rootId || null;
            var folderPath = data.folderPath.split('/').filter(function (f) { return f; });
            var content = data.content;
            delete data.content;
            log.debug({
                title: 'received ' + data.fileName + ' of ' + content.length + 'chars in ' + JSON.stringify(folderPath),
                details: JSON.stringify(data, null, ' ')
            });
            var folderId = createFolderPath(rootFolderId, folderPath, false);
            var fileSpec = {
                name: data.fileName,
                fileType: getFileType(data.mimeType, getExt(data.fileName)),
                folder: folderId,
                isOnline: Boolean(data.isPublic),
                encoding: getNSEncoding(data.encoding)
            };
            log.debug({
                title: 'assembled file spec',
                details: JSON.stringify(fileSpec, null, ' ')
            });
            fileSpec['contents'] = content;
            var upload = file.create(fileSpec);
            var fileId = upload.save();
            return {
                success: true,
                file: fileId
            };
        }
        catch (e) {
            log.error({
                title: 'uploading: ' + data.folderPath + '/' + data.fileName,
                details: (e.message || e.toString()) + (e.getStackTrace ? (' \n \n' + e.getStackTrace().join(' \n')) : '')
            });
            return {
                success: false,
                message: e.message || e.toString()
            };
        }
    }
    exports.post = post;
    function createFolderPath(parent, path, skipSearch) {
        var folderId = null;
        var nextSkip = skipSearch;
        if (!skipSearch) {
            var parentFilter = parent ?
                ['parent', 'anyof', [parent]] :
                ['istoplevel', 'is', 'T'];
            var filters = [
                parentFilter, 'AND',
                ['name', 'is', path[0]]
            ];
            log.debug({
                title: 'finding folder ' + path[0],
                details: JSON.stringify(filters, null, ' ')
            });
            search.create({
                type: 'folder',
                filters: filters,
                columns: [
                    'name'
                ]
            }).run().each(function (ref) {
                folderId = ref.id;
                nextSkip = false;
                return false;
            });
        }
        if (!folderId) {
            log.debug({
                title: 'folder: ' + path[0] + ' not found',
                details: 'create in ' + parent
            });
            var folder = record.create({
                type: 'folder'
            });
            folder.setValue({ fieldId: 'parent', value: parseInt(parent, 10) });
            folder.setValue({ fieldId: 'name', value: path[0] });
            folderId = folder.save();
            nextSkip = true;
        }
        var nextPath = path.slice(1);
        if (!nextPath.length)
            return folderId;
        return createFolderPath(folderId, nextPath, nextSkip);
    }
});
