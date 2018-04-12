const EXPECT_THROW = async (promise) => {
	try {
		await promise;
	} catch (error) {
 
		let invalidOpcode = error.message.search('invalid opcode') >= 0,
				invalidJump = error.message.search('invalid JUMP')     >= 0,
				outOfGas = error.message.search('out of gas')          >= 0;

		assert( `${invalidOpcode || invalidJump || outOfGas} Expected throw, got '${error}' instead`);
		return;
	}
	assert.fail('Expected throw not received');
 }
 
 module.exports = {
	 EXPECT_THROW
};
