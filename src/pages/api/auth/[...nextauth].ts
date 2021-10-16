// https://next-auth.js.org/getting-started/example
// yarn add next-auth
// criando autenticação de usuário com github
//yarn add @types/next-auth -D

import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import firebase from '../../../services/firebaseConnection';

export default NextAuth({

    providers: [
        Providers.GitHub({
            // esses nomes tem que ser iguais ao do .env.local
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            scope: 'read:user', // o que eu quero acessar do user
        }),
    ],

    callbacks: {
        // esse quando o user já estiver logado, vai chamar essa função
        // informações do user vindo do github
        //aqui ficou controlando tbm se o user que fez o login é um apoiador ou não

        async session(session, profile){
            try {

                const lastDonate = await firebase.firestore().collection('users')
                .doc(String(profile.sub)) //no profile.sub tenho o id do user
                .get()
                .then((snapshot) => {
                    //se o user nunca fez uma doação, não irá existir nada dele no users
                    if(snapshot.exists){
                        return snapshot.data().lastDonate.toDate();//lastDonate o mesmo nome que dei no firebase
                    } else {
                        return null; //que esse user não é apoiador
                    }
                })

                return {
                    ...session,
                    id: profile.sub, //dentro desse sub tenho o id do user

                    //se tem algo no lastDonate ele é tru(vip) se não é false
                    vip: lastDonate ? true: false,
                    lastDonate: lastDonate
                }
            } catch {
                return {
                    ...session,
                    id: null,

                    // se deu erro mandamos as propriedades zeradas aqui
                    vip: false,
                    lasDonate: null
                }
            }
        },


        // essa quando vc vai logar vai chamar essa função
        // informações do user vindo do github
        async signIn(user, account, profile){

            const { email } = user;
            try {
                return true;
            } catch (err) {
                console.log('Error:', err);
                return false;
            }

        }
    }

    //precisaremos de duas chaves, uma para Id e outra para Secret, vc cria no github
})