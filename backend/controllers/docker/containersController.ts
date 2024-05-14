// Types
import { Request, Response, NextFunction } from 'express';
import { ContainerPS, LogObject } from '../../../types';
import { execAsync, toUTC, parseLogString } from '../helper';
import { ServerError } from '../../backend-types';


interface ContainerController {
  /**
   * @method
   * @abstract Gets the list of containers on your local machine
   * @returns @param {ContainerPS[]} res.locals.containers An array of the containers
   */
  getContainers: (req: Request, res: Response, next: NextFunction) => Promise<void>;

  /**
   * @method
   * @abstract Gets a list of stopped containers 
   * @returns @param {ContainerPS[]} res.locals.containers 
   */
  getStoppedContainers: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  

/** 
 * @abstract opens up container in virtual terminal/command line, opens up a bin/sh (shell)
 * 
 */

  /**
   * @method
   * @abstract Runs a stop container based on id
   * @param {string} req.body.id
   * @returns {void}
   */
  runContainer: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  
  /**
   * @method
   * @abstract Stops a runningcontainer based on id
   * @param {string} req.body.id
   * @returns {void}
   */
  stopContainer: (req: Request, res: Response, next: NextFunction) => Promise<void>;


  bashContainer: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  /**
   * @method
   * @abstract Removes a container based on id
   * @param {string} req.params.id 
   * @returns {void}
   */
  removeContainer: (req: Request, res: Response, next: NextFunction) => Promise<void>;


  /**
   * @method
   * @abstract Gets the log for a list of containers between the start and stop time
   *           Converts this time to the users local time based on the offset provided
   * @param {string[]} req.query.containerNames An array of names of containers to check
   * @param {string} req.query.start Must check if empty. Start time in format YYYY-MM-DDTHH:MM:SSZ
   * @param {string} req.query.stop Must check if empty. Stop time in format YYYY-MM-DDTHH:MM:SSZ
   * @param {number} req.query.offset Integer for the offset of local time to UTC. Ex. EST4 = 240
   * @returns @param {object<string, LogObject[]>} res.locals.logs
   */
  getAllLogs: (req: Request<unknown, unknown, unknown, logsQuery>, res: Response, next: NextFunction) => Promise<void>;

  /**
   * @method
   * @todo write logic to actually parse the string?
   * @abstract
   * @param {string} req.query.id required
   * @returns @param {} res.locals.containerDetails
   */
  inspectContainer: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}

const containerController: ContainerController = {} as ContainerController;

containerController.getContainers = async (req, res, next) => {
  try {
    const { stdout, stderr } = await execAsync('docker ps --format "{{json .}},"');
    if (stderr.length) console.log(stderr);


    // Get list of containers in proper format
    const containers: ContainerPS[] = JSON.parse(
      `[${stdout.trim().slice(0, -1)}]`
    )
    
    containers.forEach((element): void => {
      if (typeof element['Networks'] === 'string') element['Networks'] = element['Networks'].split(',');
      if (typeof element['Labels'] === 'string') element['Labels'] = element['Labels'].split(',');
      if (typeof element['Ports'] === 'string') element['Ports'] = element['Ports'].split(',');
    });
    res.locals.containers = containers;
    return next();
  } catch (error) {
    const errObj: ServerError = {
      log: { err: `containerController.getContainers Error: ${error}` },
      status: 500,
      message: 'internal server error'
    }
    next(errObj);
  }
}

containerController.getStoppedContainers = async (req, res, next) => {
  try {
    const { stdout, stderr } = await execAsync('docker ps -f "status=exited" --format "{{json .}},"');
    if (stderr.length) throw new Error(stderr);
    const containers: ContainerPS[] = JSON.parse(`[${stdout.trim().slice(0, -1)}]`);
    res.locals.containers = containers;
    return next();
  } catch (error) {
    const errObj: ServerError = {
      log: { err: `containerController.getStoppedContainers  Error: ${error}` },
      status: 500,
      message: 'internal server error'
    }
    next(errObj);
  }
}

containerController.bashContainer = async (req, res, next) => {
  try {
    console.log('You have bashed')
    const { id } = req.body;
    const { stdout, stderr } = await execAsync(`docker exec -it ${id} /bin/sh`)
    if (stderr.length) throw new Error(stderr);
    return next()
  } catch (error) {
    const errObj: ServerError = {
      log: { err: `containerController.bashContainer  Error: ${error}` },
      status: 500,
      message: 'internal server error'
    }
    next(errObj);
  }
}


containerController.runContainer = async (req, res, next) => {
  try {
    const { id } = req.body;
    const { stdout, stderr } = await execAsync(`docker start ${id}`);
    if (stderr.length) throw new Error(stderr);
    return next();
  } catch (error) {
    const errObj: ServerError = {
      log: { err: `containerController.runContainer  Error: ${error}` },
      status: 500,
      message: 'internal server error'
    }
    next(errObj);
  }
},
  
containerController.stopContainer = async (req, res, next) => {
  try {
    const { id } = req.body;
    const { stdout, stderr } = await execAsync(`docker stop ${id}`);
    if (stderr.length) throw new Error(stderr);
    return next();
  } catch (error) {
    const errObj: ServerError = {
      log: { err: `containerController.stopContainer  Error: ${error}` },
      status: 500,
      message: 'internal server error'
    }
    next(errObj);
  }
}

containerController.removeContainer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stdout, stderr } = await execAsync(`docker rm ${id}`);
    if (stderr.length) throw new Error(stderr);

    return next();
  } catch (error) {
    const errObj: ServerError = {
      log: { err: `containerController.removeContainer  Error: ${error}` },
      status: 500,
      message: 'internal server error'
    }
    next(errObj);
  }
}

interface logsQuery {
  containerNames: string;
  start: string;
  stop: string;
  offset: number;
}

containerController.getAllLogs = async (req, res, next) => {
  try {
    const containerLogs: { [k: string]: LogObject[] } = {
      stdout: [],
      stderr: [],
    };
    let { containerNames, start, stop, offset } = req.query;
    // string string string number
    const containerList = containerNames.split(',');
    if (start === 'null') {
      start = null;
    }
    if (stop === 'null') {
      stop = null;
    }
    const optionsObj = { containerList, start, stop, offset };
    // iterate through containerIds array in optionsObj
    for (let i = 0; i < optionsObj.containerList.length; i++) {
      // build inputCommandString to get logs from command line
      let inputCommandString = `docker logs ${optionsObj.containerList[i]} -t`;
      if (optionsObj.start) inputCommandString += ` --since ${toUTC(optionsObj.start, offset)}`;
      if (optionsObj.stop) inputCommandString += ` --until ${toUTC(optionsObj.stop, offset)}`;
      const { stdout, stderr } = await execAsync(inputCommandString);
      containerLogs.stdout = [...containerLogs.stdout, ...parseLogString(stdout, optionsObj.containerList[i], offset)];
      containerLogs.stderr = [...containerLogs.stderr, ...parseLogString(stderr, optionsObj.containerList[i], offset)];
    }
    res.locals.logs = containerLogs;
    return next();
  } catch (error) {
    const errObj: ServerError = {
      log: { err: `containerController.getAllLogs Error: ${error}` },
      status: 500,
      message: 'internal server error'
    }
    return next(errObj);
  }
}

/**
 * @todo Partially built. Currently not integrated into codebase.
 */
containerController.inspectContainer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stdout, stderr } = await execAsync(`docker inspect ${id}`);
    if (stderr.length) throw new Error('Incorrect user request.')
    
    
    /**@todo make a type */
    const arrayOfMetrics = JSON.parse(stdout);
    if (arrayOfMetrics.length === 0) {
      console.log('No container exists for that id');
      return next(); // move this next
    }
    if (arrayOfMetrics.length > 1) throw new Error('Multiple containers exist for provided id');
    
    res.locals.containerDetails = arrayOfMetrics[0];

    return next();
  } catch (error) {
    const errObj: ServerError = {
      log: { err: `containerController.inspectContainer Error: ${error}` },
      status: 500,
      message: 'internal server error'
    }
    return next(errObj);
  }
}

export default containerController;