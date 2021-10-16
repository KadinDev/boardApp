import { useState, FormEvent } from 'react';

import Head from 'next/head'; //título dinâmico da página
import styles from './styles.module.scss';
import { FiPlus, FiCalendar, FiEdit2, FiTrash, FiClock, FiX } from 'react-icons/fi';

import { SupportButon } from '../../components/SupportButon';

import { GetServerSideProps } from 'next';
import { getSession, session } from 'next-auth/client';
import Link from 'next/link';

import firebase from '../../services/firebaseConnection';
import { format, formatDistance } from 'date-fns';
import { ptBR } from 'date-fns/locale'

//essas informações abaixo tem que ser as que tem no firebase tbm
// estou colocando um tipo para o data
type TaskList = {
    id: string;
    created: string | Date, // será stringo ou uma Date
    createdFormated?: string, // ?, informa que ele não é obrigatório
    tarefa: string;
    userId: string;
    nome: string;
}

//estou tipando o user para saber o que tem dentro ( id e nome )
interface BoardProps{
    user: {
        id: string;
        nome: string;
        
        vip: boolean;
        lastDonate: string | Date;
    }
    data: string;
}

// lembrando que toda página tem que ter o default
export default function Board( { user, data } : BoardProps ){

    const [input, setInput] = useState('');

    const [taskList, setTaskList] = useState<TaskList[]>(JSON.parse(data)); //agora aqui recebe esse data, ou seja, vai começar
    // com todas as tarefas cadastradas no firebase. JSON.parse(data) = estou convertendo de volta para array!
    // useState<TaskList[]>, estou informando que o taskList é um array que tem essas propriedades dentro do
    // type TaskList que criei acima, tipado.

    const [taskEdit, setTaskEdit] = useState<TaskList | null >(null);


    async function handleAddTask(e : FormEvent){ // e : FormEvent, estou tipando dizendo que
        // esse ( e ) será do tipo FormEvent. quando eu digitar abaixo e.alguma coisa,
        // ele me mostrará as opções agora.
        e.preventDefault(); //para não recarregar a página
        
        if (input === ''){
            alert('Adicione alguma tarefa')
            return;
        };

        //se o taskEdit estiver cheio então eu quero editar uma tarefa existente e não adicionar uma nova
        // assim estarei editando e atualizando tanto no banco de dados como na renderização em tela
        if (taskEdit) {
            await firebase.firestore().collection('tarefas')
            .doc(taskEdit.id)
            .update({
                tarefa: input, //lembrado que tarefa é onde coloquei para estar o title da task
            })
            .then (() => {
                let data = taskList;

                //estou procurando no awway de tarefas, aonde que tá o item que estou editando. (findIndex)
                let taskIndex = taskList.findIndex(item => item.id === taskEdit.id);
                data[taskIndex].tarefa = input //taskIndex é o número da tarefa que cliquei e estou editando

                setTaskList(data);
                setTaskEdit(null);
                setInput('');
            })
            return;
        }
        /////
        
        //cadastrando no firebase
        await firebase.firestore().collection('tarefas') //cria uma coleção chamada tarefas
        // .add vai para o firestore
        .add({ // .add vai criar um id único para cada tarefa (Auto-ID)
            //agora aqui coloco o que quero adicionar
            created: new Date(), //data da criação da tarefa
            tarefa: input,
            userId: user.id, //aqui acesso a prop  Board( { user }, pego o id do user que está cadastrando a tarefa
            nome: user.nome, //nome do usuario que criou essa tarefa
        })
        // .then, caso de sucesso
        .then( (doc) => { // (doc), acessando documento que acabei de cadastrar
            // aqui estou mandando para o array de taskList 
            console.log('Cadastrado com sucesso');

            let data = {
                id: doc.id, //acessando o id da tarefa que foi criada
                created: new Date(),
                createdFormated: format(new Date(), 'dd MMMM yyyy'), // já formatando data, dd = dia, MMMM = nome do mês, yyyy = ano
                tarefa: input,
                userId: user.id,
                nome: user.nome,
            };

            setTaskList( [ ...taskList, data ] ); //pega todas as tasks que estiver e acrescenta a do let data acima
            setInput('');
        } )
        // error ao cadastrar
        .catch ((err) => {
            console.log(err);
        })
    };


    // como o botão de ADD está dentro do handleAddTask, o código para edição vc faz dentro da função dele.
    async function handleEditTask( task: TaskList ) { //será do tipo TaskList, tipagem na linha 18
        setTaskEdit(task);
        setInput(task.tarefa);// quando clicar o title da task vai automaticamente para dentro do input
    };

    function handleCancelEditTask(){
        setInput('');
        setTaskEdit(null);
    }

    async function handleDelete ( id: string ){ //estamos esperando um id, e quero que seja uma string
        await firebase.firestore().collection('tarefas').doc(id) //doc = qual documento quero acessar. o id.
        .delete()
        .then( () => {
            console.log('Deletado com sucesso!');
            let taskDeleted = taskList.filter( item => {
                return ( item.id !== id );
            } );

            setTaskList(taskDeleted);

        } )
        .catch( (err) => {
            console.log(err);
        })
    }

    return (
        <>
            <Head>
                <title> Minhas Tarefas - Board </title>
            </Head>

            <main className={styles.container}>
                
                { taskEdit && (
                    <span className={styles.warnText}>
                        <button onClick={ handleCancelEditTask }>
                            <FiX size={30} color='#ff3636' />
                        </button>
                        Você está editando uma tarefa!
                    </span>
                ) }

                <form onSubmit={ handleAddTask } >

                    <input 
                        type="text"
                        placeholder='Digite sua tarefa'
                        value={input}
                        onChange={ (e) => setInput(e.target.value) } // e = event
                    />
                    <button type="submit">
                        <FiPlus size={25} color="#17181f" />
                    </button>

                </form>

                <h1>Você tem {taskList.length} {
                    taskList.length === 1 ? 'Tarefa' : 'Tarefas' 
                } </h1>
                
                <section>

                    { taskList.map( task => (
                        <article key={task.id} className={styles.taskList}>

                            <Link href={`/board/${task.id}`} >
                                <p> { task.tarefa } </p>
                            </Link>
                            
                            <div className={styles.actions}>
                                <div>

                                    <div>
                                        <FiCalendar size={20} color='#ffb800'/>
                                        <time> { task.createdFormated } </time>
                                    </div>
                                    
                                    { user.vip && (
                                        <button onClick={ () => handleEditTask(task) } >
                                            <FiEdit2 size={20} color='#fff' />
                                            <span>Editar</span>
                                        </button>
                                    ) }

                                </div>

                                <button onClick={ () => handleDelete(task.id) }>
                                    <FiTrash size={20} color='#ff3636' />
                                    <span>Excluir</span>
                                </button>

                            </div>
                        </article>
                    ) ) }
                    
                </section>

            </main>

            
            { user.vip && (

                <div className={styles.vipContainer}>
                    <h3>Obrigado por apoiar esse projeto.</h3>

                    <div>
                        <FiClock size={20} color='#FFF' />

                        <time>
                            Última doação foi { formatDistance(new Date(user.lastDonate), new Date(), {
                                //calculando o tempo de doação até a data e horário atual
                                locale: ptBR
                            } ) }
                        </time>
                    </div>
                </div>
                
            ) }

            <SupportButon />
        </>
    )
}


// getServerSideProps = verificação do lado do servidor
// se o user estiver logado vai pegar as informações dele, se não virá como null
// isso foi definido em [...nextauth].ts
export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    
    //acesando a sessão
    // se o user estiver logado pega as informações dele
    const session = await getSession({ req });

    // se não tiver user
    if (!session?.id){
        //se o user nao estiver logado redireciona ele
        return {
            redirect: {
                destination: '/', //vai redirecionar ele para o home
                permanent: false
            }
        }
    }

    //pegando todas as tarefas cadastradas no banco collection
    const tasks = await firebase.firestore().collection('tarefas')
    .where('userId', '==', session?.id) //pega somente as tarefas que o user logado criou, lembrando que
    //quando usa-se o where, vc precisa criar um Índeces no firebase 

    .orderBy('created', 'desc').get();
    // mapeando todos os os docs, adicionando o id e createdFormated que coloquei em baixo,
    // e todo o restante das informações no bando de cada um (...u.data)
    //JSON.stringify - estou convertendo o retorno dessa variavel em string
    const data = JSON.stringify(tasks.docs.map( u => { // u ou o nome que eu quiser
        return {
            id: u.id,
            //vai pegar o timestamp e converter para data, fazendo a formatação que escolhi ('dd MMMM yyyy')
            createdFormated: format(u.data().created.toDate(), 'dd MMMM yyyy'),
            ...u.data(),  
        } //mando esse data para a props abaixo
    }))

    console.log(session.vip)
    //lembrando que no session tbm tenho acesso se o user é vip ou não
    const user = {
        nome: session?.user.name,
        id: session?.id,

        vip: session?.vip,
        lastDonate: session?.lastDonate,
    }
    
    return {
        props: {
            user, //retorno esse user criado acima aqui, e posso receber ele como propriedade,
            // e mando ele como parametro no Board, function Board( { user }

            data, //igualmente como foi feito com o user acima, esse data mandamos junto com o user
            // no function Board( { user, data })
        }
    }
}