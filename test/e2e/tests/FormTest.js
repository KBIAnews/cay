export default {
  tags: ['form', 'standalone-form'],
  before: client => {
    const { baseUrl } = client.globals;
    const createFormPage = client.page.createFormPage();

    createFormPage
      .navigate(baseUrl + '/forms/create')
      .ready()
  },
  'User creates a Form': client => {
    const createFormPage = client.page.createFormPage();

    createFormPage
      .saveForm()

    client.pause(5000)
  },
  'User makes the form go live': client => {
    const createFormPage = client.page.createFormPage();

    createFormPage
      .goLive()
  },
  //'User saves form': client => {
  //  const createFormPage = client.page.createFormPage();
  //
  //  createFormPage
  //    .saveForm()
  //},
  //'User adds Title': client => {
  //  const createFormPage = client.page.createFormPage();
  //
  //  const title = 'Test Title';
  //
  //  createFormPage
  //    .addTitle(title)
  //
  //  // Expect
  //  createFormPage.expect.element('@formTitle').to.be.present;
  //  createFormPage.expect.element('@formTitle').to.have.value.that.equals(title);
  //},
  //'User adds Headline': client => {
  //  const createFormPage = client.page.createFormPage();
  //
  //  const headline = 'Test Headline';
  //
  //  createFormPage
  //    .addHeadline(headline)
  //
  //  // Expect
  //  createFormPage.expect.element('@formHeadline').to.be.present;
  //  createFormPage.expect.element('@formHeadline').to.have.value.that.equals(headline);
  //},
  //'User adds Description': client => {
  //  const createFormPage = client.page.createFormPage();
  //
  //  const description = 'Test Description';
  //
  //  createFormPage
  //    .addDescription(description)
  //
  //  // Expect
  //  createFormPage.expect.element('@formDescription').to.be.present;
  //  createFormPage.expect.element('@formDescription').to.have.value.that.equals(description);
  //},
  'User adds a Short Answer': client => {
    const createFormPage = client.page.createFormPage();

    createFormPage
      .addShortAnswer({
        title: 'Test Title',
        description: 'Test Description'
      })
  },
  'User adds Min Chars and test for the final form': client => {
    const createFormPage = client.page.createFormPage();
    const standAloneFormPage = client.page.standAloneFormPage();

    createFormPage
      .addMinCharsLimit(5)
      .saveForm()

    client.pause(6000)

    createFormPage
      .publishFormOptions()
      .getUrlStandaloneForm(({ url }) =>{

        createFormPage
          .closeModal()

        standAloneFormPage
            .navigate(url)
            .ready()

        // Allowed values
        client
          .url(url)
          .refresh((e) => {
            standAloneFormPage
              .addValueToTextField("tango", ({ value }) => {
                standAloneFormPage.submitStandAloneForm();
                standAloneFormPage.waitForElementPresent('@finalScreen', 3000);
              });
          })

        client
          .url(url)
          .refresh((e) => {
            standAloneFormPage
              .addValueToTextField("violins", ({ value }) => {
                standAloneFormPage.submitStandAloneForm();
                standAloneFormPage.waitForElementPresent('@finalScreen', 3000);
              });
          })

        client
          .url(url)
          .refresh((e) => {
            standAloneFormPage
              .addValueToTextField("she sells seashells by the seashore", ({ value }) => {
                standAloneFormPage.submitStandAloneForm();
                standAloneFormPage.waitForElementPresent('@finalScreen', 3000);
              });
          })

        // Not Allowed values

        client
          .url(url)
          .refresh((e) => {
            console.log(e);

            standAloneFormPage
              .addValueToTextField("doge ", ({ value }) => {
                standAloneFormPage.submitStandAloneForm();
                standAloneFormPage.waitForElementNotPresent('@finalScreen', 3000);
              })

              .addValueToTextField("red", ({ value }) => {
                standAloneFormPage.submitStandAloneForm();
                standAloneFormPage.waitForElementNotPresent('@finalScreen', 3000);
              })

              .addValueToTextField("blue", ({ value }) => {
                standAloneFormPage.submitStandAloneForm();
                standAloneFormPage.waitForElementNotPresent('@finalScreen', 3000);
              });
          })

        client.back();
      })
  },
  'User removes Short Answer': client => {
    const createFormPage = client.page.createFormPage();

    client.pause(5000)

    createFormPage
      .deleteWidget()


  },
  'User adds another Short Answer': client => {
    const createFormPage = client.page.createFormPage();

    createFormPage
      .addShortAnswer({
        title: 'Another Short Answer',
        description: 'Test Description'
      })
  },
  'User adds Max Chars and test for the final form': client => {
    const createFormPage = client.page.createFormPage();
    const standAloneFormPage = client.page.standAloneFormPage();

    const limit = 5;

    createFormPage
      .addMaxCharsLimit(limit)
      .saveForm()

    client.pause(5000)

    createFormPage
      .publishFormOptions()
      .getUrlStandaloneForm(({ url }) => {

        createFormPage
          .closeModal()

        standAloneFormPage
          .navigate(url)
          .ready()

        // Allowed values
        client
          .url(url)
          .refresh((e) => {
            standAloneFormPage
              .addValueToTextField("tango", ({ value }) => {
                standAloneFormPage.submitStandAloneForm();
                standAloneFormPage.waitForElementPresent('@finalScreen', 3000);
              });
          })

        client
          .url(url)
          .refresh((e) => {
            standAloneFormPage
              .addValueToTextField("red", ({ value }) => {
                standAloneFormPage.submitStandAloneForm();
                standAloneFormPage.waitForElementPresent('@finalScreen', 3000);
              });
          })

        client
          .url(url)
          .refresh((e) => {
            standAloneFormPage
              .addValueToTextField("blue", ({ value }) => {
                standAloneFormPage.submitStandAloneForm();
                standAloneFormPage.waitForElementPresent('@finalScreen', 3000);
              });
          })

        // Not Allowed values
        client
          .url(url)
          .refresh((e) => {
            console.log(e);

            standAloneFormPage
              .addValueToTextField("tango ", ({ value }) => {
                standAloneFormPage.assert.equal(value.length, limit);
                standAloneFormPage.waitForElementNotPresent('@finalScreen', 3000);
              })

              .addValueToTextField("violins", ({ value }) => {
                standAloneFormPage.assert.equal(value.length, limit);
                standAloneFormPage.waitForElementNotPresent('@finalScreen', 3000);
              })

              .addValueToTextField("she sells seashells by the seashore", ({ value }) => {
                standAloneFormPage.assert.equal(value.length, limit);
                standAloneFormPage.waitForElementNotPresent('@finalScreen', 3000);
              });
          })
      });

      client.back();
  },
  after: client => {
    client.end()
  }
};