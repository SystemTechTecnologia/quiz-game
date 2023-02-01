import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router'
import { BiArrowBack } from 'react-icons/bi';
import { BsArrowRepeat } from 'react-icons/bs';
import getQuestion from "../../helpers/getQuestion"
import categories from '@/assets/categories.json'

export default function Play() {
	const router = useRouter()
	const [score, setScore] = useState(1);
	const [current, setCurrent] = useState(1);

	const [question, setQuestion] = useState([]);
	const [queries, setQueries] = useState({});

	const correctSound = useRef(null);
	const wrongSound = useRef(null);

	useEffect(() => {
		getQuestion().then((question) => setQuestion(question));
		setQueries({
			questions: router.query.questions || 10,
			time: router.query.time || 20,
			mode: router.query.mode || 'classic',
			categories: router.query.categories || null
		});
	}, [router]);

	function changueCurrent(number) {
		if (number <= score) {
			document.querySelectorAll('[id^="question-"]').forEach(question => {
				question.classList.remove("slide-left", "slide-right")
				if (question.id !== `question-${number}`) {
					question.classList.add(question.id.slice(-1) < number ? "slide-left" : "slide-right")
				}
			});
			setCurrent(number)
		}
	}

	function validate(e, answer) {
		if (answer === question[current - 1].correct) {
			e.target.style.backgroundColor = "#22c55e";
			e.target.classList.add("shake-left-right");
			correctSound.current.volume = 0.3;
			correctSound.current.play();
		} else {
			e.target.style.backgroundColor = "#e11d48";
			e.target.classList.add("vibrate");
			document.querySelectorAll(`.answer-${current}`).forEach(answer => {
				answer.disabled = true;
				if (answer.textContent === question[current - 1].correct) {
					answer.style.backgroundColor = "#22c55e";
					answer.classList.add("shake-left-right");
				}
			});
			wrongSound.current.volume = 0.3;
			wrongSound.current.play();
		}
		setScore(score + 1);
	}

	useEffect(() => {
		let color;
		if (question.length > 0) {
			color = categories.find(cat => cat.name === question[current - 1]?.topic).color
		}
		document.body.style.backgroundColor = color;
	}, [current, question]);

	useEffect(() => {
		window.onbeforeunload = () => "Your game will be lost!";
	}, []);

	return (
		<>
			<Head>
				<title>Quizi | Play</title>
				<meta name="description" content="TODO" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.svg" />
			</Head>
			<div className='absolute left-5 top-1/2 -translate-y-1/2'>
				questions: {queries.questions} <br />
				time: {queries.time} <br />
				mode: {queries.mode} <br />
				categories: {queries.categories && queries.categories.split(",").map(category => {
					return <Image key={category} title={category} alt={category}
						className="invert"
						src={`/categories/${categories.find(cat => cat.id === category).name}.svg`}
						width={30} height={30} />
				})
				}
			</div>
			<div className='absolute right-5 top-1/2 -translate-y-1/2'>
				<ul className='flex gap-4 flex-col'>
					<li>
						<button className='px-4 py-2 rounded bg-blue-300 w-full'>
							Change question
						</button>
					</li>
					<li>
						<button className='px-4 py-2 rounded bg-blue-300 w-full'>
							50/50
						</button>
					</li>
					<li>
						<button className='px-4 py-2 rounded bg-blue-300 w-full'>
							Second shot
						</button>
					</li>
					<li>
						<button className='px-4 py-2 rounded bg-blue-300 w-full'>
							Extra life
						</button>
					</li>
				</ul>
			</div>
			<div className='flex gap-2'>
				<Link href="/" className='w-10'><BiArrowBack className='text-3xl' /></Link>
				<button>
					<BsArrowRepeat className='text-3xl' />
				</button>
			</div>
			<audio ref={correctSound} src="sounds/correct_answer_sound.mp3" />
			<audio ref={wrongSound} src="sounds/wrong_answer_sound.mp3" />

			<div className='max-w-2xl mx-auto absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
				<ol className="flex gap-5 mb-10 justify-between items-center w-full text-white">
					{
						queries.questions && [...Array(parseInt(queries.questions))].map((_, i) => (
							<li key={i} onClick={() => changueCurrent(i + 1)} className={`w-6 h-6 rounded-full mr-2 text-center text-sm pt-1 ${i + 1 === score ? "bg-red-400" : "bg-slate-600"} ${i + 1 <= score ? "cursor-pointer" : ""} ${i + 1 < score ? "bg-green-200" : ""} ${i + 1 === current ? "outline-dashed outline-red-600" : ""} `}>{i + 1}</li>
						))
					}
				</ol>
				<main className='relative w-screen max-w-2xl min-h-[20rem] mx-auto overflow-hidden h-1/2'>
					{
						question && question.map((question, i) => {
							return (
								<div key={question.correct} className={`transition-all duration-500 ${i === 0 ? "" : "slide-right"} absolute text-center w-full`} id={"question-" + (i + 1)}>
									<p className='rounded-md bg-purple-300 px-10 py-6 text-xl font-semibold block mb-3'>{question.question}</p>
									<ul className='md:columns-2 mb-5'>
										{question.answers && question.answers.map((answer, j) => (
											<li key={j + "answer"}>
												<button className={`${"answer-" + (i + 1)} w-full shadow-sm mt-4 bg-slate-200 py-3 px-5 rounded enabled:hover:scale-105`} onClick={(e) => validate(e, answer)}>{answer}</button>
											</li>
										))}
									</ul>
								</div>
							)
						})
					}
				</main>
			</div>
		</>
	)
}