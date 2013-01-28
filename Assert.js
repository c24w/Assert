(function set_up_c24w_namespace(c24w) {
	
	var rootNode = window;
	
	c24w.namespace = c24w.namespace || function namespace(baseNode, namespaceString, callback) {
		if (typeof baseNode === 'function') {
			callback = baseNode;
			baseNode = rootNode;
			namespaceString = undefined;
		}
		if (typeof namespaceString === 'function') {
			callback = namespaceString;
			if (typeof baseNode === 'string') {
				namespaceString = baseNode;
				baseNode = rootNode;
			}
			else namespaceString = undefined;
		}
	
		var currentNode = baseNode;
	
		if (namespaceString) {
			var nodes = namespaceString.split('.');
			nodes.forEach(function (node) { currentNode = add(node).to(currentNode); });
		}
	
		if (callback) callback(currentNode);
	};
	
	function add(newNode) {
		return {
			to: function (existingNode) {
				return existingNode[newNode] = existingNode[newNode] || {};
			}
		};
	}
	
	c24w.setNamespaceRoot = c24w.setNamespaceRoot || function setNamespaceRoot(node) {
		rootNode = node;
	};
 
})(window.c24w = window.c24w || {});

c24w.setNamespaceRoot(c24w);

c24w.namespace('Assert', function namespace_assert(Assert) {

	function buildMessage(actual, expected) {
		return 'expected: {0} found: {1}'.format(expected, actual);
	}

	function areTheSameType(obj1, obj2) {
		return typeof obj1 === typeof obj2;
	}

	function encloseInType(obj) {
		if (obj === null || typeof obj === 'undefined') return obj;
		return obj.constructor.name + '(' + obj + ')';
	}
	
	function AssertException(message) {
		this.message = message;
		this.toString = function toString() { return this.constructor.name + ': ' + this.message; };
	}

	Assert.AssertException = AssertException;

	Assert.DEFAULT_FAIL_MESSAGE = 'no additional information';

	function isUndefined(v) {
		return typeof v === 'undefined';
	}

	function assertArgs(lowerBound, upperBound) {
		var argsLength = arguments.callee.caller.arguments.length;
		if (argsLength < lowerBound)
			throw new Error('assertion expected at least {0} argument{1}'.format(lowerBound, lowerBound === 1 ? '' : 's'));
		if (argsLength > upperBound)
			throw new Error('assertion expected at most {0} argument{1}'.format(upperBound, lowerBound === 1 ? '' : 's'));
	}

	Assert.that = function assert_that(subject) {
		function AssertThat(subject) {
			var A = Assert;
			var AN = A.not;
			this.equals = function equals(expected) { A.equal(subject, expected); },
			this.throws = function throws(exception) { return A.throws(subject, exception); },
			this.does = {
				not: {
					equal: function does_not_equal(expected) { AN.equal(subject, expected); },
					'throw': function does_not_throw(exception) { AN.throws(subject, exception); }
				}
			},
			this.is = {
				'true': function is_true() { A.true(subject); },
				'false': function is_false() { A.false(subject); },
				'null': function is_null() { A.null(subject); },
				equal: { to: function is_equal_to(expected) { A.equal(subject, expected); } },
				equiv: { to: function is_equiv_to(expected) { A.equiv(subject, expected); } },
				greater: { than: function is_greater_than(expected) { A.greater(subject, expected); } },
				less: { than: function is_less_than(expected) { A.less(subject, expected); } },
				instance: { of: function is_instance_of(objClass) { A.instance(subject, objClass); } },
				type: function is_type(type) { A.type(subject, type); },
				not: {
					'null': function is_not_null() { AN.null(subject); },
					equal: { to: function is_not_null(expected) { AN.equal(subject, expected); } },
					equiv: { to: function is_not_equiv(expected) { AN.equiv(subject, expected); } },
					instance: { of: function is_not_instance(objClass) { AN.instance(subject, objClass); } },
					type: function is_not_type(type) { AN.type(subject, type); },
				}
			};
		}
		return new AssertThat(subject);
	};

	Assert['true'] = function assert_true(condition, optionalInfo) {
		assertArgs(1, 2);
		if (condition === null) throw new AssertException('assert condition was null');
		if (typeof condition !== 'boolean') throw new AssertException('assert condition was not a boolean');
		if (condition === false) {
			var info = optionalInfo || Assert.DEFAULT_FAIL_MESSAGE;
			throw new AssertException(info);
		}
	};

	Assert['false'] = function assert_false(condition, optionalInfo) {
		assertArgs(1, 2);
		if (condition === null) throw new AssertException('assert condition was null');
		if (typeof condition !== 'boolean') throw new AssertException('assert condition was not a boolean');
		Assert.true(condition === false, optionalInfo);
	};

	Assert['null'] = function assert_null(subject, optionalInfo) {
		assertArgs(1, 2);
		Assert.equal(subject, null, optionalInfo);
	};

	Assert.equal = function assert_equal(actual, expected, optionalInfo) {
		assertArgs(2, 3);
		var sameType = areTheSameType(actual, expected);
		var act = sameType ? actual : encloseInType(actual);
		var exp = sameType ? expected : encloseInType(expected);
		var info = optionalInfo || buildMessage(act, exp);
		Assert.true(actual === expected, info);
	};

	Assert.equiv = function assert_equiv(actual, expected, optionalInfo) {
		assertArgs(2, 3);
		var sameType = areTheSameType(actual, expected);
		var act = sameType ? actual : encloseInType(actual);
		var exp = sameType ? expected : encloseInType(expected);
		var info = optionalInfo || buildMessage(act, exp);
		Assert.true(actual == expected, info);
	};

	function assertIsNumber(object, prefix) {
		var actualType = object === null ? 'null' : typeof object;
		Assert.instance(object, Number, '{0}: expected: {1} found: {2}'.format(prefix, typeof Number(), actualType));
	}

	Assert.greater = function assert_greater(number1, number2, optionalInfo) {
		assertArgs(2, 3);
		assertIsNumber(number1, 'first argument');
		assertIsNumber(number2, 'second argument');
		var info = optionalInfo || '{0} is not greater than {1}'.format(number1, number2);
		Assert.true(number1 > number2, info);
	};

	Assert.less = function assert_less(number1, number2, optionalInfo) {
		assertArgs(2, 3);
		assertIsNumber(number1, 'first argument');
		assertIsNumber(number2, 'second argument');
		var info = optionalInfo || '{0} is not less than {1}'.format(number1, number2);
		Assert.true(number1 < number2, info);
	};

	Assert.instance = function assert_instance(obj, expectedClass, optionalInfo) {
		assertArgs(2, 3);
		Assert.not.null(obj, optionalInfo || 'object argument was null');
		Assert.not.null(expectedClass, optionalInfo || 'class argument was null');
		try {
			Assert.true(obj instanceof expectedClass);
		}
		catch (e) {
			var actualClass = obj.constructor.name;
			var shouldBeThisClass = expectedClass.name;
			var info = optionalInfo || buildMessage(actualClass, shouldBeThisClass);
			Assert.equal(actualClass, shouldBeThisClass, info);
		}
	};

	Assert.type = function assert_type(obj, type, optionalInfo) {
		assertArgs(2, 3);
		Assert.instance(type, String, optionalInfo || 'type argument should be a string');
		var actualType = typeof obj;
		var info = optionalInfo || buildMessage(actualType, type);
		Assert.equal(actualType, type, info);
	};

	Assert.throws = function assert_throws(func, expectedException, optionalInfo) {
		assertArgs(1, 3);
		Assert.instance(func, Function, optionalInfo || 'first argument should be a function');
		if (typeof expectedException === 'string' && typeof optionalInfo === 'undefined') {
			optionalInfo = expectedException;
			expectedException = undefined;
		}
		try {
			func();
		}
		catch (e) {
			if (typeof expectedException !== 'undefined') {
				var info = optionalInfo || buildMessage(e.constructor.name, expectedException.name);
				Assert.instance(e, expectedException, info);
			}
			return e;
		}
		var info = optionalInfo || notThrownError(expectedException);
		throw new AssertException(info);
	};

	function notThrownError(exception) {
		return (typeof exception === 'undefined') ?
			'no exceptions were thrown' :
			exception.name + ' was never thrown';
	}

	c24w.namespace('Assert.not', function namespace_assert_not() {

		Assert.not['null'] = function assert_not_null(subject, optionalInfo) {
			assertArgs(1, 2);
			Assert.not.equal(subject, null, optionalInfo);
		};

		Assert.not.equal = function assert_not_equal(actual, expected, optionalInfo) {
			assertArgs(2, 3);
			var sameType = areTheSameType(actual, expected);
			var act = sameType ? actual : encloseInType(actual);
			var exp = sameType ? expected : encloseInType(expected);
			var info = optionalInfo || buildMessage(act, 'not ' + exp);
			Assert.false(actual === expected, info);
		};

		Assert.not.equiv = function assert_not_equiv(actual, expected, optionalInfo) {
			assertArgs(2, 3);
			var sameType = areTheSameType(actual, expected);
			var act = sameType ? actual : encloseInType(actual);
			var exp = sameType ? expected : encloseInType(expected);
			var info = optionalInfo || buildMessage(act, 'not ' + exp);
			Assert.false(actual == expected, info);
		};

		Assert.not.instance = function assert_not_instance(obj, objClass, optionalInfo) {
			assertArgs(2, 3);
			Assert.not.null(obj, optionalInfo || 'object argument was null');
			Assert.not.null(objClass, optionalInfo || 'class argument was null');
			var actualClass = obj.constructor.name;
			var shouldNotBeThisClass = objClass.name;
			var info = optionalInfo || buildMessage(actualClass, 'not ' + shouldNotBeThisClass);
			Assert.not.equal(actualClass, shouldNotBeThisClass, info);
		};

		Assert.not.type = function assert_not_type(obj, type, optionalInfo) {
			assertArgs(2, 3);
			Assert.instance(type, String, optionalInfo || 'type argument should be a string');
			var actualType = typeof obj;
			var info = optionalInfo || buildMessage(actualType, 'not ' + type);
			Assert.not.equal(actualType, type, info);
		};

		Assert.not.throws = function assert_not_throws(func, unthrownException, optionalInfo) {
			assertArgs(1, 3);
			Assert.instance(func, Function, optionalInfo || 'first argument should be a function');
			if (typeof unthrownException === 'string' && typeof optionalInfo === 'undefined') {
				optionalInfo = unthrownException;
				unthrownException = undefined;
			}
			try {
				func();
			}
			catch (e) {
				if (typeof unthrownException === 'undefined') {
					throw new AssertException(optionalInfo || 'exceptions were thrown');
				}
				else {
					Assert.not.instance(e, unthrownException, optionalInfo || unthrownException.name + ' was thrown');
				}
			}
		};

	});

});