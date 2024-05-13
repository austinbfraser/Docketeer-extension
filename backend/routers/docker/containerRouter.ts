import { Router, Request, Response, NextFunction } from 'express';
import containerController from '../../controllers/docker/containersController';
const router = Router();

/**
 * @abstract 
 * @todo 
 * @param 
 * @returns
 */
router.get('/running', containerController.getContainers, (req, res) => {
  return res.status(200).json(res.locals.containers);
});

/**
 * @abstract 
 * @todo 
 * @param 
 * @returns 
 */
router.get('/stopped', containerController.getStoppedContainers, (req, res) => {
  return res.status(200).json(res.locals.containers);
});

/**
 * @abstract 
 * @todo 
 * @param 
 * @returns
 */
router.post('/bashed', containerController.bashContainer, (req: any, res: any) => {
  return res.status(201)
})

/**
 * @abstract 
 * @todo 
 * @param 
 * @returns
 */
router.get('/logs', containerController.getAllLogs, (req, res) => {
  return res.status(200).json(res.locals.logs);
})

/**
 * @abstract 
 * @todo 
 * @param 
 * @returns
 */
router.post('/start', containerController.runContainer, (req, res) => {
  return res.sendStatus(201);
});

/**
 * @abstract 
 * @todo 
 * @param 
 * @returns
 */
router.post('/stop', containerController.stopContainer, (req, res) => {
  return res.sendStatus(203);
});

/**
 * @abstract 
 * @todo 
 * @param 
 * @returns
 */
router.delete('/:id', containerController.removeContainer, (req, res) => {
  return res.sendStatus(204);
});

export default router;