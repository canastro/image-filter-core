var transformation = () => {};

module.exports = {
    register: fn => transformation = fn,
    getTransformation: () => transformation
};
