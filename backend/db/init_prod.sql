\connect docketeer

CREATE TABLE endpoint_type(
  id serial PRIMARY KEY NOT NULL,
  type_of varchar NOT NULL
);

-- CREATE TABLE datasource(
--   id serial PRIMARY KEY NOT NULL,
--   type_of integer REFERENCES endpoint_type(id) NOT NULL,
--   url varchar NOT NULL,
--   endpoint varchar,
--   ssh_key varchar,
--   match varchar,
--   jobname varchar NOT NULL
-- );

CREATE TABLE datasource(
  id serial PRIMARY KEY NOT NULL,
  type_of varchar,
  url varchar NOT NULL,
  endpoint varchar,
  match varchar,
  jobName varchar NOT NULL
);

CREATE TABLE dashboards(
  id serial PRIMARY KEY NOT NULL,
  name varchar NOT NULL,
  type_of integer NOT NULL,
  path varchar
);

CREATE TABLE services(
  id serial PRIMARY KEY NOT NULL,
  docker_instance_name varchar NOT NULL,
  docker_id varchar NOT NULL
);

CREATE TABLE snapshots(
  id serial PRIMARY KEY NOT NULL,
  metric_date varchar NOT NULL,
  diskSpace varchar NOT NULL,
  memory varchar NOT NULL,
  swap varchar NOT NULL,
  CPU_usage varchar NOT NULL,
  available_memory varchar NOT NULL
);

INSERT INTO endpoint_type (type_of) VALUES ('Docker');
INSERT INTO endpoint_type (type_of) VALUES ('Kubernetes');


--Below is just for development. Remove when feature to set prometheus configs is working.
-- INSERT INTO datasource (type_of, url, endpoint, match, jobname)
-- VALUES (2, 'http://localhost:45555', '/federation', '{job="kubernetes-apiservers"},{job="kubernetes-nodes"},{job="kubernetes-nodes-cadvisor"},{job="kubernetes-service-endpoints"}', 'federate');

ALTER TABLE endpoint_type OWNER TO admin;
ALTER TABLE datasource OWNER TO admin;
ALTER TABLE dashboards OWNER TO admin;
ALTER TABLE services OWNER TO admin;
