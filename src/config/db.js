import mongoose from 'mongoose';

function connectTodb () {

    mongoose.connect(process.env.MONODB_URI)

    .then(() => {
        console.log('Server is Connected to MongoDB');
    })

    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1); // Exit the process with an error code
    });
}

export default connectTodb;