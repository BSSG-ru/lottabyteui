
import './App.css';
import {
  Route, BrowserRouter as Router, Routes, Navigate,
} from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import React from 'react';
import { Layout } from './hoc/Layout';
import { Controls } from './pages/Controls';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { Domains, Domain } from './pages/Domains';
import { Systems, System } from './pages/Systems';
import { Tasks, Task } from './pages/Tasks';
import { QualityTasks } from './pages/QualityTasks';
import { QualityTaskSchedule } from './pages/QualityTaskSchedule';
import { LogicObjects, LogicObject } from './pages/LogicObjects';
import { Search } from './pages/Search';
import { Sample, Samples } from './pages/Samples';
import { Queries, Query } from './pages/Queries';
import { store } from './redux/store';
import { authValidate } from './redux/selectors';
import { Loading } from './pages/Loading';
import { DataAsset, DataAssets } from './pages/DataAssets';
import { Error } from './pages/Error';
import { SettingsUsers } from './pages/SettingsUsers';
import { SettingsUser } from './pages/SettingsUsers/SettingsUser';
import { SettingsConnections } from './pages/SettingsConnections';
import { SettingsConnection } from './pages/SettingsConnections/SettingsConnection';
import { SettingsRoles } from './pages/SettingsRoles';
import { SettingsRole } from './pages/SettingsRoles/SettingsRole';
import { SettingsStewards } from './pages/SettingsStewards';
import { SettingsSteward } from './pages/SettingsStewards/SettingsSteward';
import { Indicators } from './pages/Indicators';
import { Indicator } from './pages/Indicators/Indicator';
import { BusinessEntities } from './pages/BusinessEntities';
import { BusinessEntity } from './pages/BusinessEntities/BusinessEntity';
import { Settings } from './pages/Settings';
import { Products } from './pages/Products';
import { Product } from './pages/Products/Product';
import { SettingsGroup } from './pages/SettingsGroups/SettingsGroup';
import { SettingsGroups } from './pages/SettingsGroups/SettingsGroups';
import { Account } from './pages/Account/Account';
import { EntitiesModel } from './pages/EntitiesModel/EntitiesModel';
import { DQRules } from './pages/DQRules';
import { DQRule } from './pages/DQRules/DQRule';
import { ArtifactModel } from './pages/ArtifactModel';
import { FrontPage } from './pages/FrontPage';
import { Drafts } from './pages/Drafts';
import { SettingsWorkflow } from './pages/SettingsWorkflow';
import { SettingsWorkflowEdit } from './pages/SettingsWorkflow/SettingsWorkflowEdit';

function APP() {
  let validate = useSelector(authValidate);

  const { REACT_APP_VALIDATE = '' } = process.env;

  if (REACT_APP_VALIDATE === '1') {
    validate = true;
  }

  return (
    <Router>
      {validate === null ? (
        <Loading />
      ) : validate === false ? (
        <Routes>
          <Route
            path="/signin"
            element={<SignIn />}
          />
          <Route
            path="*"
            element={(
              <Navigate
                to="/signin"
                replace
              />
            )}
          />
        </Routes>
      ) : (
        <Layout>
          <Routes>
            <Route
              index
              element={<FrontPage />}
            />
            <Route path="/" element={<FrontPage />} />
          
            <Route
              path="/signin"
              element={(
                <Navigate
                  to="/"
                  replace
                />
              )}
            />
            <Route path="/model" element={<EntitiesModel artifactType="entity" />} />
            <Route path="/domains-model/:id" element={<ArtifactModel artifactType="domain" />} />
            <Route path="/assets-model/:id" element={<ArtifactModel artifactType="data_asset" />} />
            <Route path="/indicators-model/:id" element={<ArtifactModel artifactType="indicator" />} />
            <Route path="/products-model/:id" element={<ArtifactModel artifactType="product" />} />
            <Route path="/queries-model/:id" element={<ArtifactModel artifactType="entity_query" />} />
            <Route path="/samples-model/:id" element={<ArtifactModel artifactType="entity_sample" />} />
            <Route path="/systems-model/:id" element={<ArtifactModel artifactType="system" />} />
            <Route path="/tasks-model/:id" element={<ArtifactModel artifactType="task" />} />
            <Route
              path="/account"
              element={<Account />}
            />
            <Route
              path="/settings"
              element={<Settings />}
            />
            <Route
              path="/settings/connections"
              element={<SettingsConnections />}
            />
            <Route
              path="/settings/connections/edit/:id"
              element={<SettingsConnection />}
            />
            <Route
              path="/settings/connections/edit/"
              element={<SettingsConnection />}
            />
            <Route
              path="/settings/stewards"
              element={<SettingsStewards />}
            />
            <Route
              path="/settings/stewards/edit/:id"
              element={<SettingsSteward />}
            />
            <Route
              path="/settings/stewards/edit/"
              element={<SettingsSteward />}
            />
            <Route
              path="/settings/users"
              element={<SettingsUsers />}
            />
            <Route
              path="/settings/users/edit/:id"
              element={<SettingsUser />}
            />
            <Route
              path="/settings/users/edit/"
              element={<SettingsUser />}
            />
            <Route
              path="/settings/groups"
              element={<SettingsGroups />}
            />
            <Route
              path="/settings/groups/edit/:id"
              element={<SettingsGroup />}
            />
            <Route
              path="/settings/groups/edit/"
              element={<SettingsGroup />}
            />
            <Route path="/settings/workflows" element={<SettingsWorkflow />} />
            <Route path="/settings/workflows/edit" element={<SettingsWorkflowEdit />} />
            <Route path="/settings/workflows/edit/:id" element={<SettingsWorkflowEdit />} />
            <Route
              path="/domains"
              element={<Domains />}
            />
            <Route
              path="/controls"
              element={<Controls />}
            />
            <Route
              path="/settings/roles"
              element={<SettingsRoles />}
            />
            <Route
              path="/settings/roles/edit/"
              element={<SettingsRole />}
            />
            <Route
              path="/settings/roles/edit/:id"
              element={<SettingsRole />}
            />
            <Route
              path="/error"
              element={<Error />}
            />
            <Route
              path="/signup"
              element={<SignUp />}
            />
            <Route
              path="/domains/edit/:id"
              element={<Domain />}

            />
            <Route
              path="/domains/:id/version/:version_id"
              element={<Domain />}
            />
            <Route
              path="/domains/edit/"
              element={<Domain />}
            />
            <Route path="/drafts" element={<Drafts />} />
            <Route
              path="/dq_rule"
              element={<DQRules />}
            />
            <Route
              path="/dq_rule/edit/:id"
              element={<DQRule />}
            />
            <Route
              path="/dq_rule/:id/version/:version_id"
              element={<DQRule />}
            />
            <Route
              path="/dq_rule/edit/"
              element={<DQRule />}
            />
            <Route
              path="/products"
              element={<Products />}
            />
            <Route
              path="/products/edit/:id"
              element={<Product />}
            />
            <Route
              path="/products/:id/version/:version_id"
              element={<Product />}
            />
            <Route
              path="/products/edit/"
              element={<Product />}
            />
            <Route
              path="/systems"
              element={<Systems />}
            />
            <Route
              path="/systems/edit/:id"
              element={<System />}
            />
            <Route
              path="/systems/edit/"
              element={<System />}
            />
            <Route
              path="/systems/:id/version/:version_id"
              element={<System />}
            />
            <Route
              path="/indicators"
              element={<Indicators />}
            />
            <Route
              path="/indicators/edit/:id"
              element={<Indicator />}
            />
            <Route
              path="/indicators/:id/version/:version_id"
              element={<Indicator />}
            />
            <Route
              path="/indicators/edit/"
              element={<Indicator />}
            />
            <Route
              path="/business-entities"
              element={<BusinessEntities />}
            />
            <Route
              path="/business-entities/edit/:id"
              element={<BusinessEntity />}
            />
            <Route
              path="/business-entities/:id/version/:version_id"
              element={<BusinessEntity />}
            />
            <Route
              path="/business-entities/edit/"
              element={<BusinessEntity />}
            />
            <Route
              path="/quality-tasks"
              element={<QualityTasks />}
            />
            <Route
              path="/quality-schedule-tasks"
              element={<QualityTaskSchedule />}
            />
            <Route
              path="/tasks"
              element={<Tasks />}
            />
            <Route
              path="/tasks/edit/:id"
              element={<Task />}
            />
            <Route
              path="/tasks/edit/"
              element={<Task />}
            />
            <Route
              path="/logic-objects"
              element={<LogicObjects />}
            />
            <Route
              path="/logic-objects/edit/:id"
              element={<LogicObject />}
            />
            <Route
              path="/logic-objects/:id/version/:version_id"
              element={<LogicObject />}
            />
            <Route
              path="/logic-objects/edit/"
              element={<LogicObject />}
            />
            <Route
              path="/queries"
              element={<Queries />}
            />
            <Route
              path="/queries/edit/:id"
              element={<Query />}
            />
            <Route
              path="/queries/:id/version/:version_id"
              element={<Query />}
            />
            <Route
              path="/queries/edit/"
              element={<Query />}
            />
            <Route
              path="/samples"
              element={<Samples />}
            />
            <Route
              path="/samples/edit/:id"
              element={<Sample />}
            />
            <Route
              path="/samples/edit/"
              element={<Sample />}
            />
            <Route
              path="/data_assets"
              element={<DataAssets />}
            />
            <Route
              path="/data_assets/edit/:id"
              element={<DataAsset />}
            />
            <Route
              path="/data_assets/:id/version/:version_id"
              element={<DataAsset />}
            />
            <Route
              path="/data_assets/edit/"
              element={<DataAsset />}
            />
            <Route
              path="/search"
              element={<Search />}
            />
            <Route
              path="/search/:q"
              element={<Search />}
            />
            <Route
              path="*"
              element={(
                <Navigate
                  to="/error"
                  replace
                />
              )}
            />
          </Routes>
        </Layout>
      )}
    </Router>
  );
}
function App() {
  return (
    <Provider store={store}>
      <APP />
    </Provider>
  );
}

export default App;
