import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class AnswerMail {
  get key() {
    return 'AnswerMail';
  }

  // Enviando email na queue
  async handle({ data }) {
    const { response } = data;

    await Mail.sendMail({
      to: `${response.student.name} <${response.student.email}`,
      subject: 'Pergunta Respondida',
      template: 'answer',
      context: {
        student: response.student.name,
        question: response.question,
        answer: response.answer,
        answerDate: format(
          parseISO(response.answer_at),
          "'dia' dd 'de' MMMM', as' H:mm'h'",
          {
            locale: pt,
          }
        ),
      },
    });
  }
}

export default new AnswerMail();
