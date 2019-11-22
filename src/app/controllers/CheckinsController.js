import { subDays } from 'date-fns';
import { Op } from 'sequelize';
import Student from '../models/Student';
import Checkin from '../models/Checkin';

class CheckinsController {
  // Listando os Checkins
  async index(req, res) {
    const { page = 1 } = req.query;
    const checkCheckin = await Checkin.findAll({
      limit: 20,
      offset: (page - 1) * 20,
    });

    return res.json(checkCheckin);
  }

  async store(req, res) {
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(400).json({
        error: 'Student not exist',
      });
    }

    const dateLimit = subDays(new Date(), 7);

    // Checando o limite de Checkin na semana
    const validateCheckin = await Checkin.findAll({
      where: {
        student_id: req.params.id,
        createdAt: {
          [Op.gte]: dateLimit,
        },
      },
    });

    if (validateCheckin.length >= 5) {
      return res.json({
        error: 'You already done 5 checkins in the past 7 days.',
      });
    }

    // Confirmando o Checkin
    const checkin = await Checkin.create({
      student_id: req.params.id,
    });

    return res.json({ student: student.name, checkin });
  }
}

export default new CheckinsController();
