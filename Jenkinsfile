/**
 * These 2 build parameters are only required for running integration test
 */
def opts = []
// define custom build parameters
def customParameters = []
customParameters.push(booleanParam(
  name: 'FETCH_PARAMETER_ONLY',
  description: 'By default, the pipeline will exit just for fetching parameters.',
  defaultValue: true
))
customParameters.push(string(
  name: 'LIBRARY_BRANCH',
  description: 'Jenkins library branch to test',
  defaultValue: '',
  trim: true
))
opts.push(parameters(customParameters))

// set build properties
properties(opts)

/**
 * This check is only required for running integration test
 */
if (params.FETCH_PARAMETER_ONLY) {
  currentBuild.result = 'NOT_BUILT'
  error "Prematurely exit after fetching parameters."
}

node() {
  /**
   * This section is only required for running integration test.
   *
   * In real consumption of library, we should use default library branch. For
   * example:
   *
   * def lib = library("jenkins-library").org.valueadd.jenkins_library
   */
  def branch = 'master'

  if (params.LIBRARY_BRANCH) {
    branch = params.LIBRARY_BRANCH
  } else if (env.CHANGE_BRANCH) {
    branch = env.CHANGE_BRANCH
  } else if (env.BRANCH_NAME) {
    branch = env.BRANCH_NAME
  }

  echo "Jenkins library branch $branch will be used to build."
  def lib = library("jenkins-library@$branch").org.valueadd.jenkins_library

  withDockerContainer([
    image: 'circleci/node:12.16-browsers',
    args : "-v '${env.HOME}/.cache:/home/node/.cache' \
-v '${env.HOME}/sonar-scanner:${env.HOME}/sonar-scanner'"
  ]) {
    def pipeline = lib.pipelines.nrwl_nx.NrwlNxPipeline.new(this)

    /**
     * These 2 build parameters are only required for running integration test
     */
    pipeline.addBuildParameters(customParameters)

    pipeline.admins.add("patryk.zielinski@valueadd.pl")

    pipeline.setup(
      projectName: 'NrwlNx Pipeline Test',
      packageName: 'org.valueadd.jenkins_library_test.va_nodejs',
      repositorySlug: 'valueadd-robot/jenkins-library-va-nodejs',
      scmProvider: lib.scm.ScmProvider.GITHUB,
      ignoreAuditFailure: true,
      github: [
        email                     : lib.Constants.DEFAULT_GITHUB_ROBOT_EMAIL,
        usernamePasswordCredential: lib.Constants.DEFAULT_GITHUB_ROBOT_CREDENTIAL,
      ],
      publishRegistry: [
        email                     : lib.Constants.DEFAULT_NPM_REGISTRY_EMAIL,
        usernamePasswordCredential: lib.Constants.DEFAULT_NPM_REGISTRY_CREDENTIAL,
      ],
      slackChannel: [
        channel: 'jenkins-test-builds',
        domain : 'valueadd-team'
      ]
    )

    // we need npm build before test
    pipeline.build()

    pipeline.codeQuality()

    pipeline.e2e()

    def UNIT_TEST_ROOT = "coverage"
    def UNIT_TEST_REPORTS = 'test-reports'

    pipeline.test(
      name: "Unit",
      junit: "${UNIT_TEST_REPORTS}/junit/*.xml",
      cobertura: [
        // do not mark as UNSTABLE if not pass the requirement
        autoUpdateStability       : false,
        fileCoverageTargets       : '0, 0, 0',
        classCoverageTargets      : '0, 0, 0',
        methodCoverageTargets     : '0, 0, 0',
        lineCoverageTargets       : '0, 0, 0',
        conditionalCoverageTargets: '0, 0, 0',
        coberturaReportFile       : "${UNIT_TEST_ROOT}/**/cobertura-coverage.xml"
      ],
      htmlReports: [
        [dir: "${UNIT_TEST_REPORTS}/jest-stare", files: "*.html", name: "Report: Jest Stare"],
        [dir: "${UNIT_TEST_REPORTS}/html", files: "*.html", name: "Report: Unit Test"],
        [dir: "${UNIT_TEST_ROOT}", files: "**/index.html", name: "Report: Code Coverage"],
      ],
    )

    pipeline.sonarScan(
      setupArguments: [
        projectKey    : 'jenkins-test:angular',
        sources       : './apps,./libs',
        inclusions    : '**/*.ts,**/*.scss,**/*.html',
        exclusions    : '**/test.ts,**/*.d.ts,apps/**/src/environments/**/*.ts',
        testInclusions: '**/*.spec.ts,apps/*-e2e/**/*.ts'
      ],
      commentsArguments: [
        repositorySlug    : 'valueadd-robot/jenkins-library-va-nodejs',
        oAuthCredentialsId: lib.Constants.DEFAULT_GITHUB_ROBOT_CREDENTIAL
      ],
      coverageParamKey: 'typescript.lcov.reportPaths',
      coverageParamValue: {
        return sh(script: "find ./coverage -path '*lcov.info' | tr '\n' ',' | sed 's/,*\$//g'", returnStdout: true).trim()
      }
    )

    pipeline.end(
      shouldCleanWorkspace: { -> true }
    )
  }
}
