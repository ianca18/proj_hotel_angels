/*
 IDBWrapper - A cross-browser wrapper for IndexedDB
 Version 1.6.2
 Copyright (c) 2011 - 2016 Jens Arps
 http://jensarps.de/

 Licensed under the MIT (X11) license
*/
(function(p,h,k){"function"===typeof define?define(h):"undefined"!==typeof module&&module.exports?module.exports=h():k[p]=h()})("IDBStore",function(){function p(a,b){var c,d;for(c in b)d=b[c],d!==u[c]&&d!==a[c]&&(a[c]=d);return a}var h=function(a){throw a;},k=function(){},r={storeName:"Store",storePrefix:"IDBWrapper-",dbVersion:1,keyPath:"id",autoIncrement:!0,onStoreReady:function(){},onError:h,indexes:[],implementationPreference:["indexedDB","webkitIndexedDB","mozIndexedDB","shimIndexedDB"]},q=function(a,
b){"undefined"==typeof b&&"function"==typeof a&&(b=a);"[object Object]"!=Object.prototype.toString.call(a)&&(a={});for(var c in r)this[c]="undefined"!=typeof a[c]?a[c]:r[c];this.dbName=this.storePrefix+this.storeName;this.dbVersion=parseInt(this.dbVersion,10)||1;b&&(this.onStoreReady=b);var d="object"==typeof window?window:self;this.implementation=this.implementationPreference.filter(function(a){return a in d})[0];this.idb=d[this.implementation];this.keyRange=d.IDBKeyRange||d.webkitIDBKeyRange||d.mozIDBKeyRange;
this.consts={READ_ONLY:"readonly",READ_WRITE:"readwrite",VERSION_CHANGE:"versionchange",NEXT:"next",NEXT_NO_DUPLICATE:"nextunique",PREV:"prev",PREV_NO_DUPLICATE:"prevunique"};this.openDB()},t={constructor:q,version:"1.6.2",db:null,dbName:null,dbVersion:null,store:null,storeName:null,storePrefix:null,keyPath:null,autoIncrement:null,indexes:null,implementationPreference:null,implementation:"",onStoreReady:null,onError:null,_insertIdCount:0,openDB:function(){var a=this.idb.open(this.dbName,this.dbVersion),
b=!1;a.onerror=function(a){var b=!1;"error"in a.target?b="VersionError"==a.target.error.name:"errorCode"in a.target&&(b=12==a.target.errorCode);if(b)this.onError(Error("The version number provided is lower than the existing one."));else this.onError(a)}.bind(this);a.onsuccess=function(a){if(!b)if(this.db)this.onStoreReady();else if(this.db=a.target.result,"string"==typeof this.db.version)this.onError(Error("The IndexedDB implementation in this browser is outdated. Please upgrade your browser."));
else if(this.db.objectStoreNames.contains(this.storeName)){this.store=this.db.transaction([this.storeName],this.consts.READ_ONLY).objectStore(this.storeName);var d=Array.prototype.slice.call(this.getIndexList());this.indexes.forEach(function(a){var c=a.name;if(c)if(this.normalizeIndexData(a),this.hasIndex(c)){var g=this.store.index(c);this.indexComplies(g,a)||(b=!0,this.onError(Error('Cannot modify index "'+c+'" for current version. Please bump version number to '+(this.dbVersion+1)+".")));d.splice(d.indexOf(c),
1)}else b=!0,this.onError(Error('Cannot create new index "'+c+'" for current version. Please bump version number to '+(this.dbVersion+1)+"."));else b=!0,this.onError(Error("Cannot create index: No index name given."))},this);d.length&&(b=!0,this.onError(Error('Cannot delete index(es) "'+d.toString()+'" for current version. Please bump version number to '+(this.dbVersion+1)+".")));b||this.onStoreReady()}else this.onError(Error("Object store couldn't be created."))}.bind(this);a.onupgradeneeded=function(a){this.db=
a.target.result;this.db.objectStoreNames.contains(this.storeName)?this.store=a.target.transaction.objectStore(this.storeName):(a={autoIncrement:this.autoIncrement},null!==this.keyPath&&(a.keyPath=this.keyPath),this.store=this.db.createObjectStore(this.storeName,a));var d=Array.prototype.slice.call(this.getIndexList());this.indexes.forEach(function(a){var c=a.name;c||(b=!0,this.onError(Error("Cannot create index: No index name given.")));this.normalizeIndexData(a);if(this.hasIndex(c)){var g=this.store.index(c);
this.indexComplies(g,a)||(this.store.deleteIndex(c),this.store.createIndex(c,a.keyPath,{unique:a.unique,multiEntry:a.multiEntry}));d.splice(d.indexOf(c),1)}else this.store.createIndex(c,a.keyPath,{unique:a.unique,multiEntry:a.multiEntry})},this);d.length&&d.forEach(function(a){this.store.deleteIndex(a)},this)}.bind(this)},deleteDatabase:function(a,b){if(this.idb.deleteDatabase){this.db.close();var c=this.idb.deleteDatabase(this.dbName);c.onsuccess=a;c.onerror=b}else b(Error("Browser does not support IndexedDB deleteDatabase!"))},
put:function(a,b,c,d){null!==this.keyPath&&(d=c,c=b,b=a);d||(d=h);c||(c=k);var f=!1,e=null,g=this.db.transaction([this.storeName],this.consts.READ_WRITE);g.oncomplete=function(){(f?c:d)(e)};g.onabort=d;g.onerror=d;null!==this.keyPath?(this._addIdPropertyIfNeeded(b),a=g.objectStore(this.storeName).put(b)):a=g.objectStore(this.storeName).put(b,a);a.onsuccess=function(a){f=!0;e=a.target.result};a.onerror=d;return g},get:function(a,b,c){c||(c=h);b||(b=k);var d=!1,f=null,e=this.db.transaction([this.storeName],
this.consts.READ_ONLY);e.oncomplete=function(){(d?b:c)(f)};e.onabort=c;e.onerror=c;a=e.objectStore(this.storeName).get(a);a.onsuccess=function(a){d=!0;f=a.target.result};a.onerror=c;return e},remove:function(a,b,c){c||(c=h);b||(b=k);var d=!1,f=null,e=this.db.transaction([this.storeName],this.consts.READ_WRITE);e.oncomplete=function(){(d?b:c)(f)};e.onabort=c;e.onerror=c;a=e.objectStore(this.storeName)["delete"](a);a.onsuccess=function(a){d=!0;f=a.target.result};a.onerror=c;return e},batch:function(a,
b,c){c||(c=h);b||(b=k);if("[object Array]"!=Object.prototype.toString.call(a))c(Error("dataArray argument must be of type Array."));else if(0===a.length)return b(!0);var d=a.length,f=!1,e=!1,g=this.db.transaction([this.storeName],this.consts.READ_WRITE);g.oncomplete=function(){(e?b:c)(e)};g.onabort=c;g.onerror=c;var l=function(){d--;0!==d||f||(e=f=!0)};a.forEach(function(a){var b=a.type,d=a.key,e=a.value;a=function(a){g.abort();f||(f=!0,c(a,b,d))};"remove"==b?(e=g.objectStore(this.storeName)["delete"](d),
e.onsuccess=l,e.onerror=a):"put"==b&&(null!==this.keyPath?(this._addIdPropertyIfNeeded(e),e=g.objectStore(this.storeName).put(e)):e=g.objectStore(this.storeName).put(e,d),e.onsuccess=l,e.onerror=a)},this);return g},putBatch:function(a,b,c){a=a.map(function(a){return{type:"put",value:a}});return this.batch(a,b,c)},upsertBatch:function(a,b,c,d){"function"==typeof b&&(d=c=b,b={});d||(d=h);c||(c=k);b||(b={});"[object Array]"!=Object.prototype.toString.call(a)&&d(Error("dataArray argument must be of type Array."));
var f=b.keyField||this.keyPath,e=a.length,g=!1,l=!1,n=0,m=this.db.transaction([this.storeName],this.consts.READ_WRITE);m.oncomplete=function(){l?c(a):d(!1)};m.onabort=d;m.onerror=d;var v=function(b){a[n++][f]=b.target.result;e--;0!==e||g||(l=g=!0)};a.forEach(function(a){var b=a.key;null!==this.keyPath?(this._addIdPropertyIfNeeded(a),a=m.objectStore(this.storeName).put(a)):a=m.objectStore(this.storeName).put(a,b);a.onsuccess=v;a.onerror=function(a){m.abort();g||(g=!0,d(a))}},this);return m},removeBatch:function(a,
b,c){a=a.map(function(a){return{type:"remove",key:a}});return this.batch(a,b,c)},getBatch:function(a,b,c,d){c||(c=h);b||(b=k);d||(d="sparse");if("[object Array]"!=Object.prototype.toString.call(a))c(Error("keyArray argument must be of type Array."));else if(0===a.length)return b([]);var f=[],e=a.length,g=!1,l=null,n=this.db.transaction([this.storeName],this.consts.READ_ONLY);n.oncomplete=function(){(g?b:c)(l)};n.onabort=c;n.onerror=c;var m=function(a){a.target.result||"dense"==d?f.push(a.target.result):
"sparse"==d&&f.length++;e--;0===e&&(g=!0,l=f)};a.forEach(function(a){a=n.objectStore(this.storeName).get(a);a.onsuccess=m;a.onerror=function(a){l=a;c(a);n.abort()}},this);return n},getAll:function(a,b){b||(b=h);a||(a=k);var c=this.db.transaction([this.storeName],this.consts.READ_ONLY),d=c.objectStore(this.storeName);d.getAll?this._getAllNative(c,d,a,b):this._getAllCursor(c,d,a,b);return c},_getAllNative:function(a,b,c,d){var f=!1,e=null;a.oncomplete=function(){(f?c:d)(e)};a.onabort=d;a.onerror=d;
a=b.getAll();a.onsuccess=function(a){f=!0;e=a.target.result};a.onerror=d},_getAllCursor:function(a,b,c,d){var f=[],e=!1,g=null;a.oncomplete=function(){(e?c:d)(g)};a.onabort=d;a.onerror=d;a=b.openCursor();a.onsuccess=function(a){(a=a.target.result)?(f.push(a.value),a["continue"]()):(e=!0,g=f)};a.onError=d},clear:function(a,b){b||(b=h);a||(a=k);var c=!1,d=null,f=this.db.transaction([this.storeName],this.consts.READ_WRITE);f.oncomplete=function(){(c?a:b)(d)};f.onabort=b;f.onerror=b;var e=f.objectStore(this.storeName).clear();
e.onsuccess=function(a){c=!0;d=a.target.result};e.onerror=b;return f},_addIdPropertyIfNeeded:function(a){"undefined"==typeof a[this.keyPath]&&(a[this.keyPath]=this._insertIdCount++ +Date.now())},getIndexList:function(){return this.store.indexNames},hasIndex:function(a){return this.store.indexNames.contains(a)},normalizeIndexData:function(a){a.keyPath=a.keyPath||a.name;a.unique=!!a.unique;a.multiEntry=!!a.multiEntry},indexComplies:function(a,b){return["keyPath","unique","multiEntry"].every(function(c){if("multiEntry"==
c&&void 0===a[c]&&!1===b[c])return!0;if("keyPath"==c&&"[object Array]"==Object.prototype.toString.call(b[c])){c=b.keyPath;var d=a.keyPath;if("string"==typeof d)return c.toString()==d;if("function"!=typeof d.contains&&"function"!=typeof d.indexOf||d.length!==c.length)return!1;for(var f=0,e=c.length;f<e;f++)if(!(d.contains&&d.contains(c[f])||d.indexOf(-1!==c[f])))return!1;return!0}return b[c]==a[c]})},iterate:function(a,b){b=p({index:null,order:"ASC",autoContinue:!0,filterDuplicates:!1,keyRange:null,
writeAccess:!1,onEnd:null,onError:h,limit:Infinity,offset:0},b||{});var c="desc"==b.order.toLowerCase()?"PREV":"NEXT";b.filterDuplicates&&(c+="_NO_DUPLICATE");var d=!1,f=this.db.transaction([this.storeName],this.consts[b.writeAccess?"READ_WRITE":"READ_ONLY"]),e=f.objectStore(this.storeName);b.index&&(e=e.index(b.index));var g=0;f.oncomplete=function(){if(d)if(b.onEnd)b.onEnd();else a(null);else b.onError(null)};f.onabort=b.onError;f.onerror=b.onError;c=e.openCursor(b.keyRange,this.consts[c]);c.onerror=
b.onError;c.onsuccess=function(c){if(c=c.target.result)if(b.offset)c.advance(b.offset),b.offset=0;else{if(a(c.value,c,f),g++,b.autoContinue)if(g+b.offset<b.limit)c["continue"]();else d=!0}else d=!0};return f},query:function(a,b){var c=[];b=b||{};b.autoContinue=!0;b.writeAccess=!1;b.onEnd=function(){a(c)};return this.iterate(function(a){c.push(a)},b)},count:function(a,b){b=p({index:null,keyRange:null},b||{});var c=b.onError||h,d=!1,f=null,e=this.db.transaction([this.storeName],this.consts.READ_ONLY);
e.oncomplete=function(){(d?a:c)(f)};e.onabort=c;e.onerror=c;var g=e.objectStore(this.storeName);b.index&&(g=g.index(b.index));g=g.count(b.keyRange);g.onsuccess=function(a){d=!0;f=a.target.result};g.onError=c;return e},makeKeyRange:function(a){var b="undefined"!=typeof a.lower,c="undefined"!=typeof a.upper,d="undefined"!=typeof a.only;switch(!0){case d:a=this.keyRange.only(a.only);break;case b&&c:a=this.keyRange.bound(a.lower,a.upper,a.excludeLower,a.excludeUpper);break;case b:a=this.keyRange.lowerBound(a.lower,
a.excludeLower);break;case c:a=this.keyRange.upperBound(a.upper,a.excludeUpper);break;default:throw Error('Cannot create KeyRange. Provide one or both of "lower" or "upper" value, or an "only" value.');}return a}},u={};q.prototype=t;q.version=t.version;return q},this);
