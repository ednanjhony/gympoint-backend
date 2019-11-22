import * as Yup from 'yup';
import { addMonths, parseISO } from 'date-fns';
import Enrollment from '../models/Enrollment';
import Plan from '../models/Plans';
import Student from '../models/Student';

import EnrollmentMail from '../jobs/EnrollmentMail';
import Queue from '../../lib/Queue';

class EnrollmentController {
  // Listando todas as matriculas
  async index(req, res) {
    const { page = 1 } = req.query;
    const checkEnrollment = await Enrollment.findAll({
      attributes: [
        'id',
        'student_id',
        'plan_id',
        'start_date',
        'end_date',
        'price',
      ],
      limit: 20,
      offset: (page - 1) * 20,
    });

    return res.json(checkEnrollment);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Validation fails',
      });
    }

    const { student_id, plan_id, start_date } = req.body;

    const planExists = await Plan.findOne({
      where: { id: req.body.plan_id },
    });

    if (!planExists) {
      return res.status(400).json({
        error: 'Plan does not exist',
      });
    }

    const studentExists = await Student.findOne({
      where: { id: student_id },
    });

    if (!studentExists) {
      return res.status(400).json({
        error: 'Student does not exist',
      });
    }

    const enrollmentExist = await Enrollment.findByPk(student_id);
    if (enrollmentExist) {
      return res
        .status(401)
        .json({ error: 'There is already an enrollment for this student' });
    }

    // Ajustando as datas e calculando preço final
    const { duration, price } = await Plan.findByPk(plan_id);
    const parsedStartDate = parseISO(start_date);
    const parsedEndDate = addMonths(parsedStartDate, duration);

    const totalPrice = duration * price;

    const enrollmentSave = await Enrollment.create({
      student_id,
      plan_id,
      start_date,
      end_date: parsedEndDate,
      price: totalPrice,
    });

    // Configurando para mandar email depois de criar matricula
    const enrollment = await Enrollment.findByPk(enrollmentSave.id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'title'],
        },
      ],
    });

    // Enviando o Email depois de confirmar a matricula.
    await Queue.add(EnrollmentMail.key, {
      enrollment,
    });

    return res.json(enrollment);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number(),
      plan_id: Yup.number(),
      start_date: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Validation Fails',
      });
    }

    const enrollments = await Enrollment.findByPk(req.params.id);
    const { student_id, plan_id, start_date } = req.body;

    const enrollmentExist = await Enrollment.findByPk(student_id);

    if (enrollmentExist) {
      return res.status(401).json({
        error: 'Student already enrolled',
      });
    }

    const planExists = await Plan.findOne({
      where: { id: req.body.plan_id },
    });

    if (!planExists) {
      return res.status(400).json({
        error: 'Plan does not exist',
      });
    }

    const studentExists = await Student.findOne({
      where: { id: student_id },
    });

    if (!studentExists) {
      return res.status(400).json({
        error: 'Student does not exist',
      });
    }

    // Mudando data e recalculando preço final
    const { duration, price } = await Plan.findByPk(plan_id);
    const parsedStartDate = parseISO(start_date);
    const parsedEndDate = addMonths(parsedStartDate, duration);

    const totalPrice = duration * price;

    const enrollmentSave = await enrollments.update({
      student_id,
      plan_id,
      start_date,
      end_date: parsedEndDate,
      price: totalPrice,
    });

    return res.json(enrollmentSave);
  }

  async delete(req, res) {
    const enrollmentDelete = await Enrollment.destroy({
      where: { id: req.params.id },
    });

    return res.json(enrollmentDelete);
  }
}

export default new EnrollmentController();
