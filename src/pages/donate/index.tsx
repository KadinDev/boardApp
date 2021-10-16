import styles from './styles.module.scss';
import { useState } from 'react';

import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { getSession, session, useSession } from 'next-auth/client';

import Image from 'next/image';
import rocketImg from '../../../public/images/rocket.svg';

import { PayPalButtons } from '@paypal/react-paypal-js';
import firebase from '../../services/firebaseConnection';

// CLIENT ID
// Ad0L_ehFFJFz0Hs8nO9iKZL5tS_5MFTzbtq8UQWBuYhtqBXG4tolQ8kAB2JR2AnUkYg5pp1YLee6syJY
// <script src="https://www.paypal.com/sdk/js?cliente-id=YOUR_CLIENT_ID"></script>"

interface DonateProps {
    //assim já informo que o user será um objeto, para não dar erro
    user: {
        nome: string;
        id: string;
        image: string;
    }
}

export default function Donate( {user} : DonateProps ){

    const [vip, setVip] = useState(false);
    
    async function handleSaveDonate (){
        await firebase.firestore().collection('users')
        // .doc estou criando o documento users
        .doc(user.id) //acessa o id do user mandado acima ali no Donate
        // .set o quero passar para o doc que estou criando
        .set({
            donate: true,//que ele é doador agora
            lastDonate: new Date(),
            image: user.image, //passa o img tbm para usar nas imagens de doadores da home
        })

        .then ( () => {
            setVip(true);
        } )
    }
    
    return (
        <>
            <Head>
                <title>Ajude a plataforma boar ficar online!</title>
            </Head>

            <main className={styles.container}>
                <Image src={rocketImg} alt="Seja Apoiador"/>
                
                
                { vip && (
                    <div className={styles.vip}>
                        <img src={user.image} alt="Imagem apoiador"/>
                        <span>Parabéns você é um novo apoiador.</span>
                    </div>
                ) }


                <h1>Seja um apoiador desse projeto! 🏆</h1>
                <h3>Contribua com apenas <span>R$ 1,00</span> </h3>
                <strong>Apareça na nossa home, tenha functionalidades exclusivas.</strong>


                <PayPalButtons
                    createOrder={ (data, actions)=>{
                        return actions.order.create({ //cria produto
                            purchase_units: [{
                                amount: {
                                    value: '1' //valor do produto
                                }
                            }]
                        })
                    } }
                    
                    onApprove = { ( data, actions ) => {
                        //fazendo pagamento
                        return actions.order.capture().then( function (details){
                            console.log('Compra aprovada:' + details.payer.name.given_name ) //pega o nome da pessoa
                            
                            handleSaveDonate();
                        } )
                    }}
                />
            
            </main>
        </>
    )
}


export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    const session = await getSession({ req });

    //se não tiver a pessoa logada
    if(!session?.id){
        return {
            redirect: {
                destination: '/',
                permanent: false
            }
        }
    }

    const user = {
        nome: session?.user.name,
        id: session?.id,
        image: session?.user.image
    }

    return {
        props: {
            user
        }
    }
}