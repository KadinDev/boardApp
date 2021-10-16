import { useState } from 'react';

import { GetStaticProps } from 'next';// trabalhando com página estática

import Head from 'next/head'; //para títulos dinâmicos
import styles from '../styles/styles.module.scss';

import Image from 'next/image';
import boardUser from '../../public/images/board-user.svg';

import firebase from '../services/firebaseConnection';

type Data = {
  id: string;
  donate: boolean;
  lastDonate: Date;
  image: string;
}

interface HomeProps {
  data: string;
}

export default function Home({data} : HomeProps) { //data vem como string

  const [donaters, setDonaters] = useState<Data[]>(JSON.parse(data)); //converte data em array

  return (
    <>
      <Head>
        <title> Board - Organizando suas tarefas. </title>
      </Head>
      
      <main className={styles.contentContainer} >

        <Image src={boardUser} alt="Ferramenta board"/>

        <section className={styles.callToAction}>
          <h1> Uma ferramenta para seu dia a dia, escreva, planeje e organize-se... </h1>
          <p>
            <span>100% Gratuita</span> e online.
          </p>
        </section>


        <div className={styles.donaters} >
          
          { donaters.length !== 0 && <h3>Apoiadores</h3> }

          { donaters.map( item => (
            <img key={item.image} src={item.image} alt=""/>
          ) ) }

        </div>

      </main>
    </>
  )
}


// trabalhando com página estática
export const getStaticProps: GetStaticProps = async () => {
  
  //pegar todos os users que apoiaram
  const donaters = await firebase.firestore().collection('users').get(); //.get já pega todos

  //converte em string, data vem como array
  const data = JSON.stringify(donaters.docs.map( u => { //percorre todos
    return {
      id: u.id, //pega o id do user
      ...u.data(), //pega todo o restante além do id do user
    }
  } ))

  
  return {
    props: {
      data
    },
    revalidate: 60 * 60 // página atualiza a cada 60 minutos. 60 ali é segundos 
  }
}