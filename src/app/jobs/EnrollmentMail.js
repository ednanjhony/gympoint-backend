import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class EnrollmentMail {
  get key() {
    return 'EnrollmentMail';
  }

  // Enviando email na queue
  async handle({ data }) {
    const { enrollment } = data;

    await Mail.sendMail({
      to: `${enrollment.student.name} <${enrollment.student.email}>`,
      subject: 'Matricula confirmada',
      template: 'enrollments',
      context: {
        student: enrollment.student.name,
        plan: enrollment.plan.title,
        price: enrollment.price,
        start_date: format(parseISO(enrollment.start_date), 'dd/MM/yyyy', {
          locale: pt,
        }),
        end_date: format(parseISO(enrollment.end_date), 'dd/MM/yyyy', {
          locale: pt,
        }),
      },
    });
  }
}

export default new EnrollmentMail();
