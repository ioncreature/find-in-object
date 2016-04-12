Object.defineProperties( Object.prototype, {
    find: {
        /**
         * @param {string|number|Function|RegExp} needle
         * @param {number?} depth - depth of search in tree, default is 3
         */
        value: function( needle, depth ){
            return find( this, needle, depth );
        },
        enumerable: false
    },

    filter: {
        /**
         * @param {string|number|Function|RegExp} needle
         * @param {number?} depth - depth of search in tree, default is 3
         */
        value: function( needle, depth ){
            return filter( this, needle, depth );
        },
        enumerable: false
    },

    flatFilter: {
        /**
         * @param {string|number|Function|RegExp} needle
         * @param {number?} depth - depth of search in tree, default is 3
         */
        value: function( needle, depth ){
            return flatFilter( this, needle, depth );
        },
        enumerable: false
    },

    getByPath: {
        /**
         * @param {string} path - dot delimited string like "some.path"
         */
        value: function( path ){
            return getByPath( this, path );
        },
        enumerable: false
    }
});


/**
 * Finds needle string recursively in keys and values
 * It's useful to find some key or value in big objects when debugging in console
 * @param {Object} object
 * @param {string|number|Function|RegExp} needle
 * @param {number?} depth - depth of search in tree, default is 3
 * @return Array - list of paths
 */
function find( object, needle, depth ){
    if ( depth <= 0 )
        return [];
    else if ( typeof depth == 'undefined' )
        depth = 3;

    if ( !isObject(object) )
        return [];

    var keys = Object.keys( object ),
        searchResults = [],
        key,
        value,
        i,
        test;

    if ( isFunction(needle) )
        test = testFunc;
    else if ( needle instanceof RegExp )
        test = testRegExp;
    else
        test = testString;

    for ( i = 0; i < keys.length; i++ ){
        key = keys[i];
        value = object[key];

        // search in key
        if ( test(key, needle) )
            searchResults.push( key );

        // search in value: string or number
        if ( typeof value == 'string' || typeof value == 'number' || value instanceof Number || value instanceof String )
            test( String(value), needle ) && searchResults.push( key );

        // search in value: array or object
        else if ( isObject(value) )
            find( value, needle, depth - 1 ).forEach( function( val ){
                searchResults.push( key + '.' + val );
            });
    }

    return arrayUnique( searchResults );
}


/**
 * Finds needle string recursively in keys and values, returns filtered Object
 * @param {Object} object
 * @param {string|Function|RegExp} needle
 * @param {number?} depth - depth of search in tree, default is 3
 * @return Object
 */
function filter( object, needle, depth ){
    var paths = find( object, needle, depth ),
        result = {};

    paths.forEach( function( path ){
        copy( object, result, path );
    });

    return result;
}


/**
 * Finds needle string recursively in keys and values, returns Object like {'some.path': 'value'}
 * @param {Object} object
 * @param {string|Function|RegExp} needle
 * @param {number?} depth - depth of search in tree, default is 3
 * @return Object
 */
function flatFilter( object, needle, depth ){
    var paths = find( object, needle, depth );
    return paths.reduce( function( res, path ){
        res[path] = getByPath( object, path );
        return res;
    }, {} );
}


function testString( value, str ){
    return value.indexOf( str ) > -1;
}


function testFunc( value, fn ){
    return fn( value );
}


function testRegExp( value, re ){
    return re.test( value );
}


function arrayUnique( array, compareFn ){
    return array.filter( function( val, i ){
        for ( var j = i + 1; j < array.length; j++ ){
            if ( compareFn )
                return compareFn( array[i], array[j] );
            else if ( array[i] === array[j] )
                return false;
        }

        return true;
    });
}


/**
 * @param {Object|Array} from
 * @param {Object|Array} to
 * @param {Array|string} path
 */
function copy( from, to, path ){
    if ( !isObject(to) )
        return;

    if ( !path || path.length === 0 )
        return to;

    var splittedPath = isArray( path ) ? [].concat(path) : path.split( '.' ),
        key = splittedPath[0],
        value = from[key];

    if ( !from.hasOwnProperty(key) )
        return to;

    if ( isPrimitive(value) || isFunction(value) ){
        to[key] = value;
        return to;
    }

    if ( to.hasOwnProperty(key) ){
        to[key] = copy( value, to[key], splittedPath.splice(1) );
        return to;
    }

    if ( splittedPath.length === 1 ){
        to[key] = value;
        return to;
    }

    to[key] = copy( value, isArray(value) ? [] : {}, splittedPath.splice(1) );
    return to;
}


function isPrimitive( val ){
    var type = typeof val;
    return val === null || (type != 'function' && type != 'object');
}


function isFunction( val ){
    return typeof val == 'function';
}


function isObject( val ){
    return typeof val == 'object' && val !== null;
}


function isArray( val ){
    return val instanceof Array;
}


function getByPath( obj, path ){
    var res = obj,
        way = path instanceof Array ? path : path.split( '.' );

    if ( !res || !isObject(res) )
        return;

    for ( var i = 0; i < way.length; i++ ){
        if ( res.hasOwnProperty(way[i]) )
            res = res[way[i]];
        else
            return;
    }

    return res;
}