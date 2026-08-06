import mongoose from 'mongoose';

function connectTodb(): void {

    mongoose.connect(process.env.MONGODB_URI as string)

    .then(() => {
        console.log('Server is Connected to MongoDB');
    })

    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1); // Exit the process with an error code
    });
}

export default connectTodb;
