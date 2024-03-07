import { RemoveCors } from './Controllers/RemoveCors/Cloudinaryfunc.js';

RemoveCors(
	'https://platinumlist.net/guide/wp-content/uploads/2023/03/IMG-worlds-of-adventure.webp',
	'testFile'
)
	.then((result) => {
		console.log(result);
	})
	.catch((error) => {
		console.log(error);
	});
