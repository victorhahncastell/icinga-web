<?php
// {{{ICINGA_LICENSE_CODE}}}
// -----------------------------------------------------------------------------
// This file is part of icinga-web.
// 
// Copyright (c) 2009-2014 Icinga Developer Team.
// All rights reserved.
// 
// icinga-web is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// icinga-web is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with icinga-web.  If not, see <http://www.gnu.org/licenses/>.
// -----------------------------------------------------------------------------
// {{{ICINGA_LICENSE_CODE}}}


class Reporting_Provider_SchedulerJobView extends ReportingBaseView {
    public function executeHtml(AgaviRequestDataHolder $rd) {
        $this->setupHtml($rd);

        $this->setAttribute('_title', 'Provider.Scheduler');
    }

    public function executeJson(AgaviRequestDataHolder $rd) {
        $factory = $this->getContext()->getModel('JasperSoapFactory', 'Reporting', array(
                       'jasperconfig' => $rd->getParameter('jasperconfig')
                   ));

        $scheduler = $this->getContext()->getModel('JasperScheduler', 'Reporting', array(
                         'client' => $factory->getSoapClientForWSDL(Reporting_JasperSoapFactoryModel::SERVICE_SCHEDULER),
                         'jasperconfig' => $rd->getParameter('jasperconfig'),
                         'uri' => $rd->getParameter('uri')
                     ));

        $parameters = $this->getContext()->getModel('JasperParameterStruct', 'Reporting', array(
                          'client' => $factory->getSoapClientForWSDL(Reporting_JasperSoapFactoryModel::SERVICE_REPOSITORY),
                          'jasperconfig' => $rd->getParameter('jasperconfig'),
                          'uri' => $rd->getParameter('uri'),
                          'filter' => 'inputControl'
                      ));

        $stdClass = new stdClass();

        if ($rd->hasParameter('job')) {
            $stdClass->job = $scheduler->getJobDetail($rd->getParameter('job'));
        } else {
            $stdClass->job = null;
        }

        $stdClass->inputControls = $parameters->getJsonStructure();

        return json_encode($stdClass);
    }
}

?>