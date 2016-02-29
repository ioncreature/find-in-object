require( './find.js' );
var assert = require( 'assert'),
    noop = function(){},
    array = [
        noop,
        1,
        1.5,
        true,
        false,
        null,
        undefined,
        ['string'],
        {some: 'string'}
    ],
    obj = {
        fn: noop,
        str: 'this is string',
        int: 100500,
        float: 100.5,
        false: false,
        true: true,
        null: null,
        undef: undefined,
        array: array,
        obj: {
            fn: noop,
            str: 'this is string',
            int: 100500,
            float: 100.5,
            false: false,
            true: true,
            null: null,
            undef: undefined,
            array: array,
            obj: {
                obj: {
                    str: 'deeply hidden string',
                    obj: {}
                }
            }
        }
    };


testFind();
testFilter();
testFlatFilter();
console.log( 'All tests passed successfully!' );

function testFind(){
    assert.deepEqual(
        obj.find( 'nothing' ),
        [],
        'should return empty array'
    );

    assert.deepEqual(
        obj.find( 'fn' ),
        ['fn', 'obj.fn'],
        'should find in keys by string'
    );

    assert.deepEqual(
        obj.find( /fn/ ),
        ['fn', 'obj.fn'],
        'should find in keys by regexp'
    );

    assert.deepEqual(
        obj.find( function( value ){
            return value === 'fn';
        }),
        ['fn', 'obj.fn'],
        'should find in keys by regexp'
    );

    assert.deepEqual(
        obj.find( 'string' ),
        ['str', 'array.7.0', 'array.8.some', 'obj.str'],
        'should find in values by string(without deeply nested items)'
    );

    assert.deepEqual(
        obj.find( 'string', 4 ),
        ['str', 'array.7.0', 'array.8.some', 'obj.str', 'obj.array.7.0', 'obj.array.8.some', 'obj.obj.obj.str'],
        'should find in values by string(with deeply nested items)'
    );

    assert.deepEqual(
        obj.find( 100 ),
        ['int', 'float', 'obj.int', 'obj.float'],
        'should find by number'
    );

    assert.deepEqual(
        obj.find( 'obj' ),
        ['obj', 'obj.obj', 'obj.obj.obj'],
        'should find in keys by string "obj"'
    );
}


function testFilter(){
    assert.deepEqual(
        obj.filter( 'fn' ),
        {fn: obj.fn, obj: {fn: noop}},
        'should return filtered obj'
    );

    assert.deepEqual(
        obj.filter( 'deeply hidden string' ),
        {},
        'should return empty obj'
    );

    assert.deepEqual(
        obj.filter( 'deeply hidden string', 4 ),
        {obj: {obj: {obj: {str: 'deeply hidden string'}}}},
        'should return filtered obj'
    );
}


function testFlatFilter(){

}