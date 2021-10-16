/* esse arquivo será para acessar quando vc clica no title de alguma Task
 ele vai mandar para o /board/id-da-task-clicada, aí criamos assim: [id].tsx
pasando o id como parametro*/

import { GetServerSideProps } from "next";
import { getSession } from "next-auth/client";
import firebase from '../../services/firebaseConnection';
import { format } from 'date-fns';

import Head from 'next/head';
import styles from './task.module.scss';
import { FiCalendar } from 'react-icons/fi';

type Task = {
    id: string;
    created: string | Date;
    createdFormated? : string;
    tarefa: string;
    userId: string;
    nome: string;
}

interface TaskListProps {
    data: string; //estou tipando o data ali, informando que é uma string.
    //porem desse jeito se eu colocar {data.alguma coisa}, ele não vai me informar os itens que tenho dentro do data
    //pq no firebase vem tudo como string, e precisa que venham em objeto

    //para isso criamos o Task acima, e colocamos em uma variavel recebendo o JSON.parse e o data para dentro
    //convertendo o data para objeto novamente e informando que ele será do tipo Task ( as Task )
    // ...
}

export default function Task({ data } : TaskListProps ){

    /* ... agora sim quando eu digitar { task.alguma-coisa }, ele irá me monstrar o objeto com o type
    no formato que criei 
    */
    const task = JSON.parse(data) as Task;

    return (
        <>
        <Head>
            <title>Detalhes da tarefa</title>
        </Head>

        <article className={styles.container}>
            <div className={styles.actions}>
                <div>
                    <FiCalendar size={30} color='#FFF' />
                    <span>Tarefa criada:</span>
                    <time> {task.createdFormated} </time>
                </div>
            </div>
            <p> {task.tarefa} </p>
        </article>
        </>
    )
}


//para verificação se tem usuário logado
export const getServerSideProps: GetServerSideProps = async ({ req, params }) => {
    
    const {id} = params; //pegando o id da task clicada

    //para verificação se tem usuário logado
    const session = await getSession({ req }); //passo a requisição (req) para o session
    
    //antes aqui era !session?.id
    //agora fazendo com o vip, se ele é doador ou nao
    //essa parte se o user é doador ou nao foi toda configurada em [...nextauth].ts
    if (!session?.vip) {
        return {
            redirect: {
                destination: '/board',
                permanent: false
            }
        }
    }

    const data = await firebase.firestore().collection('tarefas')
    .doc(String(id)) //documento que quero acessar, o desse id da task clicada
    .get()
    .then((snapshot)=>{ //snapshot nome padrão que chamamos na comunidade
        const data = {
            id: snapshot.id,
            created: snapshot.data().created,
            createdFormated: format(snapshot.data().created.toDate(), 'dd MMMM yyyy'),
            tarefa: snapshot.data().tarefa,
            userId: snapshot.data().userId,
            nome: snapshot.data().nome,
        }

        return JSON.stringify(data); //retornando em formato de string
    })
    //se algo der errado
    .catch( () => {
        return {};
    } )

    //verificando se um objeto é vazio, o objeto verificado aqui é o data acima na linha 85
    // se o id da task digitada não existir vai redirecionar para o board
    if( Object.keys(data).length === 0 ) {
        return {
            redirect: {
                destination: '/board',
                permanent: false
            }
        }
    }

    return {
        props: {
            data, //passa data aqui e pode acessar no componente acima: Task()...
        }
    }
}