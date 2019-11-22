import * as Yup from 'yup';
import Plans from '../models/Plans';

class PlansController {
  // Listando todos os planos
  async index(req, res) {
    const { page = 1 } = req.query;
    const checkPlan = await Plans.findAll({
      attributes: ['id', 'title', 'duration', 'price'],
      limit: 20,
      offset: (page - 1) * 20,
    });

    return res.json(checkPlan);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      duration: Yup.number().required(),
      price: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Validation fails',
      });
    }
    // Criando um plano
    const { id, title, duration, price } = await Plans.create(req.body);

    return res.json({
      id,
      title,
      duration,
      price,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      duration: Yup.number(),
      price: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Validation Fails',
      });
    }

    // Editando o plano
    const { title } = req.body;
    const plans = await Plans.findByPk(req.params.id);

    if (title !== plans.title) {
      const plansExists = await Plans.findOne({
        where: { title },
      });

      if (plansExists) {
        return res.status(400).json({
          error: 'Plan already exists',
        });
      }
    }

    const { duration, price } = await plans.update(req.body);

    return res.json({
      title,
      duration,
      price,
    });
  }

  async delete(req, res) {
    const planDelete = await Plans.destroy({
      where: { id: req.params.id },
    });

    return res.json(planDelete);
  }
}

export default new PlansController();
