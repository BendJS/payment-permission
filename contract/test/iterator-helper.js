const makeIterator = function(array) {
  var nextIndex = 0;
  return {
     next: function() {
         return nextIndex < array.length ?
             {value: array[nextIndex++], done: false} :
             {done: true};
     }
  };
}


module.exports = {
	makeIterator
};