import bcrypt from 'bcrypt';

class Hashing{

    static hash(text){

        return new Promise((resolve,reject)=>{

                const saltRounds=10;

                bcrypt.genSalt(saltRounds,(err, salt)=>{
                    if(err) reject(err);
                    bcrypt.hash(text, salt, (err, hash)=>{
                        if(err) reject(err);
                        resolve(hash);
                    });
                });

        });
        
    }


}

export default Hashing;