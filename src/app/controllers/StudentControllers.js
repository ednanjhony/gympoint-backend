import * as Yup from 'yup';
import Student from '../models/Student';

class StudentController {
  // Listando todos os alunos
  async index(req, res) {
    const { page = 1 } = req.query;
    const checkStudent = await Student.findAll({
      attributes: ['id', 'name', 'email', 'idade', 'peso', 'altura'],
      limit: 20,
      offset: (page - 1) * 20,
    });

    return res.json(checkStudent);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      idade: Yup.number()
        .required()
        .positive(),
      peso: Yup.number().required(),
      altura: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Validation fails',
      });
    }

    const studentExists = await Student.findOne({
      where: { email: req.body.email },
    });

    if (studentExists) {
      return res.status(400).json({
        error: 'Student already exists.',
      });
    }

    // Confirmando aluno novo
    const { id, name, email, idade, peso, altura } = await Student.create(
      req.body
    );

    return res.json({
      id,
      name,
      email,
      idade,
      peso,
      altura,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      idade: Yup.number(),
      peso: Yup.number(),
      altura: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Validation fails',
      });
    }

    const { email } = req.body;
    const student = await Student.findByPk(req.params.id);

    if (email !== student.email) {
      const studentExists = await Student.findOne({
        where: { email },
      });

      if (studentExists) {
        return res.status(400).json({
          error: 'User already exists.',
        });
      }
    }

    // Atualizando info do aluno
    const { name, idade, peso, altura } = await student.update(req.body);

    return res.json({
      name,
      email,
      idade,
      peso,
      altura,
    });
  }

  async delete(req, res) {
    const { id } = req.params;

    await Student.destroy({ where: { id } });
    return res.status(200).json({
      message: 'Student deleted.',
    });
  }
}

export default new StudentController();
