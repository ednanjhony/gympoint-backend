import * as Yup from 'yup';
import HelpOrders from '../models/HelpOrders';
import Student from '../models/Student';

import AnswerMail from '../jobs/AnswerMail';
import Queue from '../../lib/Queue';

class HelpOrdersController {
  async index(req, res) {
    const student = await Student.findByPk(req.params.id);

    if (student) {
      // Perguntas de alunos especificos
      const noAnswerYet = await HelpOrders.findAll({
        where: {
          student_id: req.params.id,
        },
      });

      return res.json(noAnswerYet);
    }
    // Todas perguntas nao respondidas
    const noAnswerYet = await HelpOrders.findAll({
      where: { answer: null },
    });

    return res.json(noAnswerYet);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      question: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Validation fails',
      });
    }

    const { id } = req.params;
    const { question } = req.body;

    const student = await Student.findByPk(id);

    // validando Student
    if (!student) {
      return res.status(400).json({
        error: 'Student not exists.',
      });
    }

    const help_order = await HelpOrders.create({
      student_id: id,
      question,
    });

    return res.json({
      help_order,
      student: { student_id: id, student_name: student.name },
    });
  }

  // eslint-disable-next-line consistent-return
  async update(req, res) {
    const schema = Yup.object().shape({
      answer: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Validation fails.',
      });
    }

    const helpOrder_id = req.params.id;
    const helpOrder = await HelpOrders.findByPk(helpOrder_id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'email'],
        },
      ],
    });

    if (helpOrder) {
      const noAnswerYet = await HelpOrders.findAll({
        where: {
          answer: null,
        },
      });

      if (noAnswerYet) {
        const { answer } = req.body;
        const answer_at = new Date();

        const response = await helpOrder.update({
          answer,
          answer_at,
        });

        // Enviando email
        await Queue.add(AnswerMail.key, {
          response,
        });

        return res.json(response);
      }
    }
  }
}

export default new HelpOrdersController();
