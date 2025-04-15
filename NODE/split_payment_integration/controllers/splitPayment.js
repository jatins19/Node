import Stripe from "stripe"


const stripe = new Stripe('key');

const vendorAccountStrip = async (req, res) => {
  try {
    const { details } = req?.body;
    const account = await stripe.accounts.create({
      type: 'custom',
      country: 'ES',
      email: 'dheeraj1visionvivante@gmail.com', // from req'
      business_type: "individual",
      business_profile: {
        url: 'https://bomoapi.co/',
        mcc: '8931',
        support_address: {
          city: 'Panchkula',
          country: 'ES',
          state: 'Haryana',
          line1: 'Panchkula, Haryana, India',
          postal_code: '28001',
        }
      },
      capabilities: {
        transfers: { requested: true },
      },
      tos_acceptance: {
        service_agreement: 'recipient',
      },
      individual: {
        address: {
          city: 'Panchkula',
          state: 'Haryana',
          line1: 'Panchkula, Haryana, India,',
          postal_code: '28001',
        },
        dob: {
          day: '06',
          month: '01',
          year: '2000'
        },
        email: 'dheeraj1visionvivante@gmail.com',
        first_name: 'dheeraj',
        last_name: 'gehlot',
        gender: 'male',
        phone: '+918005743273',
        id_number: '11111111'
      }
    });


    // console.log(upAccount,"upAccount")
    // var frontFile = fs.readFileSync(`${__dirname}/../public/${req.body.document_front}`);
    // var backFile = fs.readFileSync(`${__dirname}/../public/${req.body.document_back}`);

    // var identity_data_front = await stripe.files.create({
    //   purpose: 'identity_document',
    //   file: {
    //     data: frontFile,
    //     name: req.body.frontImageName,
    //     type: 'application/octet-stream',
    //   },
    // });
    // var identity_data_back = await stripe.files.create({
    //   purpose: 'identity_document',
    //   file: {
    //     data: backFile,
    //     name: req.body.backImageName,
    //     type: 'application/octet-stream',
    //   },
    // });
    return res.status(200).json({ status: true, message: "Vendor Added", response: account/* , bankAccount: bankAccount */ });
  } catch (error) {
    console.error("Error processing payment:", error);
    return res.status(500).json({ status: false, message: "Something went wrong", error });
  }
}


const addBankAccount = async (req, res) => {
  try {
    const { account_id } = req?.body;
    const token = await stripe.tokens.create({
      bank_account: {
        country: 'ES',
        currency: 'eur',
        account_holder_name: 'dheeraj', // from req
        account_holder_type: 'individual',
        account_number: 'ES0700120345030000067890', // Use IBAN for Spain
      },
    });
    // const bankAccount = await stripe.accounts.createExternalAccount(account.id, { external_account: token.id });
    const bankAccount = await stripe.accounts.createExternalAccount(account_id, { external_account: token.id });

    return res.status(200).json({ status: true, message: "Vendor Added", response: bankAccount/* , bankAccount: bankAccount */ });
  } catch (error) {
    console.error("Error processing payment:", error);
    return res.status(500).json({ status: false, message: "Something went wrong", error });
  }
}

const acceptAggriment = async (req, res) => {
  try {
    const { account_id } = req?.body;
    var ipaddress = req.ip;
    if (ipaddress.substr(0, 7) == "::ffff:") {
      ipaddress = ipaddress.substr(7)
    }

    let ts = Date.now();
    var tos_accept = Math.floor(ts / 1000);
    const upAccount = await stripe.accounts.update(
      account_id,
      { tos_acceptance: { date: tos_accept, ip: ipaddress } }
    );
    return res.status(200).json({ status: true, message: "Vendor Added", response: upAccount/* , bankAccount: bankAccount */ });
  } catch (error) {
    console.error("Error processing payment:", error);
    return res.status(500).json({ status: false, message: "Something went wrong", error });
  }
}

const deleteVendorAccount = async (req, res) => {
  try {
    const { id } = req?.body;
    const deleted = await stripe.accounts.del(id);
    return res.status(200).json({ status: true, message: "Vendor deleted", response: deleted });

  } catch (error) {
    console.error("Error processing payment:", error);
    return res.status(500).json({ status: false, message: "Something went wrong", error });
  }
}

const stripPayment = async (req, res) => {
  try {
    const { customerId, amount, connectedAccountId } = req?.body;
    var customer = await stripe.customers.retrieve(customerId);
    var card = await stripe.customers.retrieveSource(
      customerId,
      customer.default_source
    );
    let vanderToPay = Math.floor(((amount * 100) * 95 )/ 100);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Amount in cents
      currency: 'usd',
      customer: customerId,
      capture_method: 'manual',
      payment_method: card.id,
      automatic_payment_methods: {
        allow_redirects: 'never',
        enabled: true
      },
      // application_fee_amount: Math.floor(((amount * 100) * 5 )/ 100), // Your 5% fee
      transfer_data: {
        destination: connectedAccountId,
        amount: vanderToPay,
      },
    });
    await stripe.paymentIntents.confirm(paymentIntent.id);
    await stripe.paymentIntents.capture(paymentIntent?.id);
    return res.status(200).json({ status: true, message: "Vendor Added", response: paymentIntent });
  } catch (error) {
    console.error("Error processing payment:", error);
    return res.status(500).json({ status: false, message: "Something went wrong", error });
  }
};

const capturePayment = async (req, res) => {
  try {
    const { paymentIntent } = req?.body;
  } catch (error) {

  }
}

export default {
  vendorAccountStrip,
  addBankAccount,
  acceptAggriment,
  stripPayment,
  deleteVendorAccount
}